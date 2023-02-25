import signale from "signale";
import {
    checkLoggedIn,
    checkValidFile,
    getWhatsAppId,
    initWASocket,
    parseGeoLocation,
    sendFileHelper,
    sendImageHelper,
    terminate
} from "./whatsapp";

export async function sendMessage(recipient: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending message: "${message}" to: ${whatsappId}`);
            message = message.replace(/\\n/g, '\n');
            await socket.sendMessage(whatsappId, {text: message});
            signale.success('Done');
            terminate(socket, 3);
        }
    });
}

export async function sendImage(recipient: string, path: string, options: { caption: string | undefined }) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending image file: "${path}" to: ${whatsappId}`);
            await sendImageHelper(socket, whatsappId, path, options);
        }
    });
}

export async function sendFile(recipient: string, path: string) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending file: "${path}" to: ${whatsappId}`);
            await sendFileHelper(socket, whatsappId, path);
        }
    });
}

export async function sendLocation(recipient: string, latitude: string, longitude: string) {
    checkLoggedIn();
    const geolocation = parseGeoLocation(latitude, longitude);
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
            const {connection} = update
            if (connection === 'open') {
                const whatsappId = await getWhatsAppId(socket, recipient);
                signale.await(`Sending location: ${geolocation[0]}, ${geolocation[1]} to: ${whatsappId}`);
                await socket.sendMessage(whatsappId, {
                    location: {
                        degreesLatitude: geolocation[0],
                        degreesLongitude: geolocation[1]
                    }
                });
                signale.success('Done');
                terminate(socket, 3);
            }
        }
    );
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

export async function listGroups() {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const groupData = await socket.groupFetchAllParticipating()
            for (const group in groupData) {
                signale.log(`{"id": "${groupData[group].id}", "subject": "${groupData[group].subject}"}`);
            }
            terminate(socket);
        }
    });
}

export async function sendGroupMessage(id: string, message: string) {
    await sendMessage(`${id}@g.us`, message);
}

export async function sendGroupImage(id: string, path: string, options: { caption: string | undefined }) {
    await sendImage(`${id}@g.us`, path, options);
}

export async function sendGroupLocation(id: string, latitude: string, longitude: string) {
    await sendLocation(`${id}@g.us`, latitude, longitude);
}

export async function sendGroupFile(id: string, path: string) {
    await sendFile(`${id}@g.us`, path);
}