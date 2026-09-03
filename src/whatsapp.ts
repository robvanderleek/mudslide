import makeWASocket, {delay, DisconnectReason, fetchLatestWaWebVersion, useMultiFileAuthState, WASocket} from "baileys";
import pino from "pino";
import path from "path";
import * as fs from "fs";
import {Boom} from "@hapi/boom";
import signale from "signale";
import * as os from "os";
import mime from 'mime';
import {readPhoneNumber} from "./utils";
import * as QRCode from 'qrcode-terminal';
import {GeneralSendOptions} from "./entities/GeneralSendOptions";

export const globalOptions = {
    logLevel: 'silent',
    connectTimeoutMs: 3_000,
    defaultQueryTimeoutMs: 6_000
}

export const mudslideFooter = '\u2B50 Please star Mudslide on GitHub! https://github.com/robvanderleek/mudslide';

export function getAuthStateCacheFolderLocation() {
    if (process.env.MUDSLIDE_CACHE_FOLDER) {
        return process.env.MUDSLIDE_CACHE_FOLDER;
    } else {
        const homedir = os.homedir();
        if (process.platform === 'win32') {
            return path.join(homedir, 'AppData', 'Local', 'mudslide', 'Data');
        } else {
            return path.join(homedir, '.local', 'share', 'mudslide');
        }
    }
}

function clearCacheFolder() {
    const folder = initAuthStateCacheFolder();
    fs.readdirSync(folder).forEach(f => f.endsWith(".json") && fs.rmSync(`${folder}/${f}`));
}

function initAuthStateCacheFolder() {
    const folderLocation = getAuthStateCacheFolderLocation();
    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, {recursive: true});
        signale.log(`Created mudslide cache folder: ${folderLocation}`);
    }
    return folderLocation;
}

export async function initWASocket(message?: string): Promise<WASocket> {
    const {state, saveCreds} = await useMultiFileAuthState(initAuthStateCacheFolder());
    const os = process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'Windows' : 'Linux';
    const {version} = await fetchLatestWaWebVersion({});
    const socket = makeWASocket({
        connectTimeoutMs: globalOptions.connectTimeoutMs,
        defaultQueryTimeoutMs: globalOptions.defaultQueryTimeoutMs,
        logger: pino({level: globalOptions.logLevel}),
        auth: state,
        browser: [os, 'Chrome', '10.15.0'],
        version: version,
        syncFullHistory: false,
        getMessage: async _ => {
            return {
                conversation: message
            }
        }
    });
    socket.ev.on('creds.update', async () => await saveCreds());
    return socket;
}

export async function terminate(socket: any, waitSeconds = 1) {
    if (waitSeconds > 0) {
        signale.await(`Closing WA connection, waiting for ${waitSeconds} second(s)...`);
    }
    await delay(waitSeconds * 1000);
    socket.end(undefined);
    if (socket.ws && socket.ws.isOpen) {
        await socket.ws.close();
    }
    console.info(mudslideFooter);
    process.exit();
}

export function checkLoggedIn() {
    if (!fs.existsSync(path.join(initAuthStateCacheFolder(), 'creds.json'))) {
        signale.error('Not logged in');
        process.exit(1);
    }
}

export function checkValidFile(path: string) {
    if (!(fs.existsSync(path) && fs.lstatSync(path).isFile())) {
        signale.error(`Could not read image file: ${path}`);
        process.exit(1);
    }
}

export function isLoggedOutDisconnect(lastDisconnect: any): boolean {
    return (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut;
}

export function parseGeoLocation(latitude: string, longitude: string): Array<number> {
    const latitudeFloat = parseFloat(latitude);
    const longitudeFloat = parseFloat(longitude);
    if (isNaN(latitudeFloat) || isNaN(longitudeFloat)) {
        signale.error(`Invalid geo location: ${latitude}, ${longitude}`);
        process.exit(1);
    }
    return [parseFloat(latitudeFloat.toFixed(7)), parseFloat(longitudeFloat.toFixed(7))];
}

export async function waitForKey(message: string) {
    signale.pause(message);
    if (process.stdin.isTTY)
        process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', () => {
        if (process.stdin.isTTY)
            process.stdin.setRawMode(false);
        resolve(undefined);
    }));
}

async function loginSecondPass() {
    signale.info('Restart required, logging in again...');
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update;
        if (connection === 'open') {
            await waitForKey("Wait until WhatsApp finishes connecting, then press any key to exit");
            await terminate(socket);
            signale.success('Logged in');
        }
    });
}

export async function loginWithPairingCode() {
    const number = await readPhoneNumber();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect} = update;
        if (connection == "connecting") {
            signale.await('Waiting 5 seconds before requesting pairing code');
            await delay(5000);
            const pairingCode = await socket.requestPairingCode(number);
            if (pairingCode && pairingCode.length === 8) {
                signale.info('In the WhatsApp mobile app go to "Settings > Connected Devices > ');
                signale.info('Connect Device" and enter the following pairing code:');
                signale.info(pairingCode.substring(0, 4) + '-' + pairingCode.substring(4, 8));
            }
        } else if (connection === 'close') {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
                await loginSecondPass();
            } else {
                signale.error('Device was disconnected from WhatsApp, use "logout" command first');
                return;
            }
        }
    });
}

export async function loginWithQrCode() {
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect, qr} = update;
        if (qr) {
            signale.info('In the WhatsApp mobile app go to "Settings > Connected Devices > ');
            signale.info('Connect Device" and scan the QR code below');
            QRCode.generate(qr, {small: true});
        }
        if (connection === 'close') {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                await loginSecondPass();
            } else {
                signale.error('Device was disconnected from WhatsApp, use "logout" command first');
                return;
            }
        }
    });
}

export async function logout() {
    checkLoggedIn();
    const socket = await initWASocket();
    let exiting = false;
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (exiting) {
            return;
        } else if ((update.connection === undefined && update.qr) || connection === 'close') {
            exiting = true;
            clearCacheFolder();
            signale.success(`Logged out`);
            await terminate(socket);
        } else if (connection === 'open') {
            exiting = true;
            await socket.logout();
            clearCacheFolder();
            signale.success(`Logged out`);
            await terminate(socket);
        }
    });
    process.on('exit', clearCacheFolder);
}

export function onConnectionOpen(socket: any, onOpen: () => Promise<void>) {
    const onConnectionUpdate = async (update: any) => {
        const {connection, lastDisconnect} = update;
        if (connection === 'open') {
            socket.ev.off('connection.update', onConnectionUpdate);
            await onOpen();
        } else if (connection === 'close') {
            signale.error(isLoggedOutDisconnect(lastDisconnect) ? 'Device unlinked from WhatsApp' : 'Connection closed unexpectedly');
            socket.end(undefined);
            process.exit(1);
        }
    };
    socket.ev.on('connection.update', onConnectionUpdate);
}

export async function getWhatsAppId(socket: any, recipient: string) {
    if (recipient.startsWith('+')) {
        recipient = recipient.substring(1);
    }
    if (recipient.endsWith('@s.whatsapp.net') || recipient.endsWith('@g.us')) {
        return recipient;
    } else if (recipient === 'me') {
        const user = await socket.user;
        if (user) {
            const phoneNumber = user.id.substring(0, user.id.indexOf(':'));
            return `${phoneNumber}@s.whatsapp.net`;
        }
    }
    return `${recipient}@s.whatsapp.net`;
}

export async function checkNumberExistsOnWhatsApp(socket: any, whatsappId: string): Promise<boolean> {
    const result = await socket.onWhatsApp(whatsappId);
    return !!result?.[0]?.exists;
}

export async function simulateTyping(socket: any, whatsappId: string, ms: number) {
    await socket.sendPresenceUpdate('composing', whatsappId);
    await delay(ms);
    await socket.sendPresenceUpdate('paused', whatsappId);
}

export async function sendSocketMessage(socket: any, whatsappId: string, payload: any,
                                        options: GeneralSendOptions = {}) {
    if (options.liveCheck) {
        const exists = await checkNumberExistsOnWhatsApp(socket, whatsappId);
        if (!exists) {
            signale.error(`Recipient does not exist on WhatsApp: ${whatsappId}`);
            socket.end(undefined);
            process.exit(1);
        }
    }
    if (options.typing) {
        await simulateTyping(socket, whatsappId, options.typing);
    }
    await socket.sendMessage(whatsappId, payload);
    signale.success('Done');
    await terminate(socket, 3);
}

export async function sendImageHelper(socket: any, whatsappId: string, filePath: string, options: {
    caption: string | undefined
} & GeneralSendOptions) {
    const payload = {image: fs.readFileSync(filePath), caption: handleNewlines(options.caption)}
    await sendSocketMessage(socket, whatsappId, payload, options);
}

export async function sendFileHelper(socket: any, whatsappId: string, filePath: string,
                                     options: {
                                         caption: string | undefined,
                                         type: 'audio' | 'video' | 'document'
                                     } & GeneralSendOptions) {
    const payload: any = {
        mimetype: mime.getType(filePath),
        caption: handleNewlines(options.caption)
    };
    switch (options.type) {
        case "audio":
            payload['audio'] = fs.readFileSync(filePath);
            break;
        case "video":
            payload['video'] = fs.readFileSync(filePath);
            break;
        default:
            payload['document'] = fs.readFileSync(filePath);
            payload['fileName'] = path.basename(filePath)
    }
    await sendSocketMessage(socket, whatsappId, payload, options);
}

export function handleNewlines(s?: string): string | undefined {
    if (s) {
        return s.replace(/\\n/g, '\n');
    }
}
