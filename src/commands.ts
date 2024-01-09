import signale from "signale";
import {
    checkLoggedIn,
    checkValidFile,
    getAuthStateCacheFolderLocation,
    getWhatsAppId,
    handleNewlines,
    initWASocket,
    parseGeoLocation,
    sendFileHelper,
    sendImageHelper,
    terminate
} from "./whatsapp";

export async function sendMessage(recipient: string, message: string, options: {
    footer: string | undefined,
    button: Array<string>
}) {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending message: "${message}" to: ${whatsappId}`);
            const buttons = options.button ? options.button.map((b, idx) => ({
                buttonId: `id${idx}`,
                buttonText: {displayText: b},
                type: 1
            })) : [];
            const whatsappMessage: any = {};
            whatsappMessage['text'] = handleNewlines(message);
            if (options.footer) {
                whatsappMessage['footer'] = options.footer;
            }
            if (buttons.length > 0) {
                whatsappMessage['buttons'] = buttons;
                whatsappMessage['headerType'] = 1;
            }
            await socket.sendMessage(whatsappId, whatsappMessage);
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

export async function sendFile(recipient: string, path: string, options: {
    caption: string | undefined,
    type: 'audio' | 'video' | 'document'
}) {
    checkValidFile(path);
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsappId = await getWhatsAppId(socket, recipient);
            signale.await(`Sending file: "${path}" to: ${whatsappId}`);
            await sendFileHelper(socket, whatsappId, path, options);
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

export async function sendPoll(recipient: string, name: string, options: {
    item: Array<string>,
    selectable: number
}) {
    if (options.item.length <= 1) {
        signale.error('Not enough poll options provided');
        process.exit(1);
    }
    if (options.selectable < 0 || options.selectable > options.item.length) {
        signale.error(`Selectable should be >= 0 and <= ${options.item.length}`);
        process.exit(1);
    }
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
            const {connection} = update
            if (connection === 'open') {
                const whatsappId = await getWhatsAppId(socket, recipient);
                signale.await(`Sending poll: "${name}" to: ${whatsappId}`);
                await socket.sendMessage(whatsappId, {
                    poll: {
                        name: name,
                        selectableCount: options.selectable,
                        values: options.item,
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
    signale.log(`Cache folder: ${getAuthStateCacheFolderLocation()}`);
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

export async function mutateGroup(groupId: string, phoneNumber: string, operation: "add" | "remove") {
    checkLoggedIn();
    const socket = await initWASocket();
    socket.ev.on('connection.update', async (update) => {
        const {connection} = update
        if (connection === 'open') {
            const whatsAppId = await getWhatsAppId(socket, phoneNumber);
            if (operation === 'add') {
                signale.log(`Adding ${whatsAppId} to group ${groupId}`);
            } else {
                signale.log(`Removing ${whatsAppId} from group ${groupId}`);
            }
            await socket.groupParticipantsUpdate(groupId, [whatsAppId], operation);
            terminate(socket);
        }
    });
}