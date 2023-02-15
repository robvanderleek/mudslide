import signale from "signale";
import {checkLoggedIn, checkValidFile, initWASocket, parseGeoLocation, sendImageHelper, terminate} from "./whatsapp";

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

export async function sendGroupImage(id: string, path: string, options: { caption: string | undefined }) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket(true);
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = `${id}@g.us`;
            signale.await(`Sending image file: "${path}" to: ${whatsappId}`);
            await sendImageHelper(socket, whatsappId, path, options)
        }
    });
}

export async function sendGroupLocation(id: string, latitude: string, longitude: string) {
    checkLoggedIn();
    const geolocation = parseGeoLocation(latitude, longitude);
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
            const {connection} = update
            if (connection === 'open') {
                const whatsappId = `${id}@g.us`;
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