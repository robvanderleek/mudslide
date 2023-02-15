import signale from "signale";
import {checkLoggedIn, checkValidFile, initWASocket, parseGeoLocation, sendImageHelper, terminate} from "./whatsapp";

export async function sendMessage(recipient: string, message: string) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const phoneNumber = await getPhoneNumber(socket, recipient);
            signale.await(`Sending message: "${message}" to: ${phoneNumber}`);
            message = message.replace(/\\n/g, '\n');
            const whatsappId = `${phoneNumber}@s.whatsapp.net`;
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
            const phoneNumber = await getPhoneNumber(socket, recipient);
            signale.await(`Sending image file: "${path}" to: ${phoneNumber}`);
            const whatsappId = `${phoneNumber}@s.whatsapp.net`;
            await sendImageHelper(socket, whatsappId, path, options)
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
                const phoneNumber = await getPhoneNumber(socket, recipient);
                signale.await(`Sending location: ${geolocation[0]}, ${geolocation[1]} to: ${phoneNumber}`);
                const whatsappId = `${phoneNumber}@s.whatsapp.net`;
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

async function getPhoneNumber(socket: any, recipient: string) {
    if (recipient === 'me') {
        const user = await socket.user;
        if (user) {
            return user.id.substring(0, user.id.indexOf(':'));
        }
    } else {
        return recipient;
    }
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