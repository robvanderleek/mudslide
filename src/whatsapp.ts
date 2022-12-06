import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@adiwajshing/baileys";
import pino from "pino";
import path from "path";
import * as fs from "fs";
import {Boom} from "@hapi/boom";
import signale from "signale";
import * as os from "os";

function getAuthStateCacheFolder() {
    const homedir = os.homedir();
    let folder;
    if (process.platform === 'win32') {
        folder = path.join(homedir, 'AppData', 'Local', 'mudslide', 'Data');
    } else {
        folder = path.join(homedir, '.local', 'share', 'mudslide');
    }
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
        signale.log(`Created mudslide cache folder: ${folder}`);
    }
    return folder;
}

async function initWASocket(printQR = true, message: string | undefined = undefined) {
    const {state, saveCreds} = await useMultiFileAuthState(getAuthStateCacheFolder());
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

function terminate(socket: any, waitSeconds = 0) {
    if (waitSeconds > 0) {
        signale.await(`Waiting ${waitSeconds} second(s) for successful delivery...`);
    }
    setTimeout(() => {
        socket.end(undefined);
        socket.ws.close();
        process.exit();
    }, waitSeconds * 1000)
}

function checkLoggedIn() {
    if (!fs.existsSync(path.join(getAuthStateCacheFolder(), 'creds.json'))) {
        signale.error('Not logged in');
        process.exit(1);
    }
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
                await waitForKey("Wait until WhatsApp finished then press any key to exit");
                terminate(socket);
            } else {
                terminate(socket);
            }
        }
    });
}

export async function logout() {
    checkLoggedIn();
    const sock = await initWASocket(false);
    fs.rmSync(path.join(getAuthStateCacheFolder(), 'creds.json'));
    sock.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (update.connection === undefined && update.qr) {
            signale.success(`Logged out`);
            terminate(sock);
        }
        if (connection === 'open') {
            await sock.logout();
            signale.success(`Logged out`);
            terminate(sock);
        }
    });
}

export async function sendMessage(recipient: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            if (recipient === 'me') {
                const user = await socket.user;
                if (user) {
                    recipient = user.id.substring(0, user.id.indexOf(':'));
                }
            }
            signale.await(`Sending message: "${message}" to: ${recipient}`);
            message = message.replace(/\\n/g, '\n');
            const whatsappId = `${recipient}@s.whatsapp.net`;
            await socket.sendMessage(whatsappId, {text: message});
            signale.success('Done');
            terminate(socket, 3);
        }
    });
}

export async function sendGroupMessage(id: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket(true, message);
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = `${id}@g.us`;
            signale.await(`Sending message: "${message}" to: ${whatsappId}`);
            message = message.replace(/\\n/g, '\n');
            await socket.sendMessage(whatsappId, {text: message});
            signale.success('Done');
            terminate(socket, 3);
        }
    });
}

export async function listGroups() {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const groupData = await socket.groupFetchAllParticipating()
            for (const group in groupData) {
                signale.log(`{id: ${groupData[group].id}, subject: ${groupData[group].subject}`);
            }
            terminate(socket);
        }
    });
}

export async function me() {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const user = await socket.user
            signale.log(`Current user: ${user?.id}`);
            terminate(socket);
        }
    });
}
