import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@adiwajshing/baileys";
import pino from "pino";
import * as os from "os";
import path from "path";
import * as fs from "fs";
import {Boom} from "@hapi/boom";
import signale from "signale";

function getAuthStateCacheFolder() {
    const homeDir = os.homedir();
    if (!homeDir) {
        console.error('Could not resolve home directory!');
        process.exit(1);
    }
    const folder = path.join(homeDir, '.local', 'share', 'jackknife');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
        console.log(`Created jackknife cache folder: ${folder}`);
    }
    return folder;
}

async function initWASocket(printQR = true) {
    const {state, saveCreds} = await useMultiFileAuthState(getAuthStateCacheFolder());
    const socket = makeWASocket({
        logger: pino({level: 'silent'}),
        auth: state,
        printQRInTerminal: printQR
    });
    socket.ev.on('creds.update', async () => await saveCreds());
    return socket;
}

function terminate(socket: any) {
    socket.end(undefined);
    socket.ws.close();
    process.exit();
}

function checkLoggedIn() {
    if (!fs.existsSync(path.join(getAuthStateCacheFolder(), 'creds.json'))) {
        signale.error('Not logged in');
        process.exit(1);
    }
}


export async function login() {
    let waitForWA = false;
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect} = update
        if (connection === 'close') {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                waitForWA = true;
                await login();
            } else {
                return;
            }
        } else if (connection === 'open') {
            signale.success('Logged in');
            if (waitForWA) {

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

export async function sendMessage(id: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            signale.await(`Sending message: "${message}" to: ${id}`);
            const whatsappId = `${id}@s.whatsapp.net`;
            await socket.sendMessage(whatsappId, {text: message});
            signale.success('Done');
            terminate(socket);
        }
    });
}

export async function sendGroupMessage(id: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            // const groupData = await socket.groupFetchAllParticipating()
            // console.log(groupData);
            const whatsappId = `${id}@g.us`;
            signale.await(`Sending message: "${message}" to: ${whatsappId}`);
            await socket.sendMessage(whatsappId, {text: message});
            signale.success('Done');
            terminate(socket);
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
