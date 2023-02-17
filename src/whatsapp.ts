import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@adiwajshing/baileys";
import pino from "pino";
import path from "path";
import * as fs from "fs";
import {Boom} from "@hapi/boom";
import signale from "signale";
import * as os from "os";

function getAuthStateCacheFolderLocation() {
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

function initAuthStateCacheFolder() {
    const folderLocation = getAuthStateCacheFolderLocation();
    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, {recursive: true});
        signale.log(`Created mudslide cache folder: ${folderLocation}`);
    }
    return folderLocation;
}

export async function initWASocket(printQR = true, message: string | undefined = undefined) {
    const {state, saveCreds} = await useMultiFileAuthState(initAuthStateCacheFolder());
    const socket = makeWASocket({
        logger: pino({level: 'silent'}),
        auth: state,
        printQRInTerminal: printQR,
        getMessage: async _ => {
            return {
                conversation: message
            }
        }
    });
    socket.ev.on('creds.update', async () => await saveCreds());
    return socket;
}

export function terminate(socket: any, waitSeconds = 0) {
    if (waitSeconds > 0) {
        signale.await(`Waiting ${waitSeconds} second(s) for successful delivery...`);
    }
    setTimeout(() => {
        socket.end(undefined);
        socket.ws.close();
        process.exit();
    }, waitSeconds * 1000)
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
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve(undefined);
    }));
}

export async function login(waitForWA = false) {
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect} = update
        if (connection === 'close') {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                await login(true);
            } else {
                return;
            }
        } else if (connection === 'open') {
            signale.success('Logged in');
            if (waitForWA) {
                await waitForKey("Wait until WhatsApp finishes connecting, then press any key to exit");
                terminate(socket);
            } else {
                terminate(socket);
            }
        }
    });
}

export async function logout() {
    checkLoggedIn();
    const socket = await initWASocket(false);
    const folder = initAuthStateCacheFolder();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (update.connection === undefined && update.qr) {
            fs.readdirSync(folder).forEach(f => f.endsWith(".json") && fs.rmSync(`${folder}/${f}`));
            signale.success(`Logged out`);
            terminate(socket);
        }
        if (connection === 'open') {
            await socket.logout();
            fs.readdirSync(folder).forEach(f => f.endsWith(".json") && fs.rmSync(`${folder}/${f}`));
            signale.success(`Logged out`);
            terminate(socket);
        }
    });
}

export async function sendImageHelper(socket: any, whatsappId: string, path: string, options: { caption: string | undefined }) {
    const payload = {image: fs.readFileSync(path), caption: options.caption}
    await socket.sendMessage(whatsappId, payload);
    signale.success('Done');
    terminate(socket, 3);
}