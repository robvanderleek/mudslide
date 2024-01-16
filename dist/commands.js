"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateGroup = exports.listGroups = exports.me = exports.sendPoll = exports.sendLocation = exports.sendFile = exports.sendImage = exports.sendMessage = void 0;
const signale_1 = __importDefault(require("signale"));
const whatsapp_1 = require("./whatsapp");
function sendMessage(recipient, message, options) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsappId = yield (0, whatsapp_1.getWhatsAppId)(socket, recipient);
                signale_1.default.await(`Sending message: "${message}" to: ${whatsappId}`);
                const buttons = options.button ? options.button.map((b, idx) => ({
                    buttonId: `id${idx}`,
                    buttonText: { displayText: b },
                    type: 1
                })) : [];
                const whatsappMessage = {};
                whatsappMessage['text'] = (0, whatsapp_1.handleNewlines)(message);
                if (options.footer) {
                    whatsappMessage['footer'] = options.footer;
                }
                if (buttons.length > 0) {
                    whatsappMessage['buttons'] = buttons;
                    whatsappMessage['headerType'] = 1;
                }
                yield socket.sendMessage(whatsappId, whatsappMessage);
                signale_1.default.success('Done');
                (0, whatsapp_1.terminate)(socket, 3);
            }
        }));
    });
}
exports.sendMessage = sendMessage;
function sendImage(recipient, path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkValidFile)(path);
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsappId = yield (0, whatsapp_1.getWhatsAppId)(socket, recipient);
                signale_1.default.await(`Sending image file: "${path}" to: ${whatsappId}`);
                yield (0, whatsapp_1.sendImageHelper)(socket, whatsappId, path, options);
            }
        }));
    });
}
exports.sendImage = sendImage;
function sendFile(recipient, path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkValidFile)(path);
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsappId = yield (0, whatsapp_1.getWhatsAppId)(socket, recipient);
                signale_1.default.await(`Sending file: "${path}" to: ${whatsappId}`);
                yield (0, whatsapp_1.sendFileHelper)(socket, whatsappId, path, options);
            }
        }));
    });
}
exports.sendFile = sendFile;
function sendLocation(recipient, latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkLoggedIn)();
        const geolocation = (0, whatsapp_1.parseGeoLocation)(latitude, longitude);
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsappId = yield (0, whatsapp_1.getWhatsAppId)(socket, recipient);
                signale_1.default.await(`Sending location: ${geolocation[0]}, ${geolocation[1]} to: ${whatsappId}`);
                yield socket.sendMessage(whatsappId, {
                    location: {
                        degreesLatitude: geolocation[0],
                        degreesLongitude: geolocation[1]
                    }
                });
                signale_1.default.success('Done');
                (0, whatsapp_1.terminate)(socket, 3);
            }
        }));
    });
}
exports.sendLocation = sendLocation;
function sendPoll(recipient, name, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.item.length <= 1) {
            signale_1.default.error('Not enough poll options provided');
            process.exit(1);
        }
        if (options.selectable < 0 || options.selectable > options.item.length) {
            signale_1.default.error(`Selectable should be >= 0 and <= ${options.item.length}`);
            process.exit(1);
        }
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsappId = yield (0, whatsapp_1.getWhatsAppId)(socket, recipient);
                signale_1.default.await(`Sending poll: "${name}" to: ${whatsappId}`);
                yield socket.sendMessage(whatsappId, {
                    poll: {
                        name: name,
                        selectableCount: options.selectable,
                        values: options.item,
                    }
                });
                signale_1.default.success('Done');
                (0, whatsapp_1.terminate)(socket, 3);
            }
        }));
    });
}
exports.sendPoll = sendPoll;
function me() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkLoggedIn)();
        signale_1.default.log(`Cache folder: ${(0, whatsapp_1.getAuthStateCacheFolderLocation)()}`);
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const user = yield socket.user;
                signale_1.default.log(`Current user: ${user === null || user === void 0 ? void 0 : user.id}`);
                (0, whatsapp_1.terminate)(socket);
            }
        }));
    });
}
exports.me = me;
function listGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const groupData = yield socket.groupFetchAllParticipating();
                for (const group in groupData) {
                    signale_1.default.log(`{"id": "${groupData[group].id}", "subject": "${groupData[group].subject}"}`);
                }
                (0, whatsapp_1.terminate)(socket);
            }
        }));
    });
}
exports.listGroups = listGroups;
function mutateGroup(groupId, phoneNumber, operation) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, whatsapp_1.checkLoggedIn)();
        const socket = yield (0, whatsapp_1.initWASocket)();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (connection === 'open') {
                const whatsAppId = yield (0, whatsapp_1.getWhatsAppId)(socket, phoneNumber);
                if (operation === 'add') {
                    signale_1.default.log(`Adding ${whatsAppId} to group ${groupId}`);
                }
                else {
                    signale_1.default.log(`Removing ${whatsAppId} from group ${groupId}`);
                }
                yield socket.groupParticipantsUpdate(groupId, [whatsAppId], operation);
                (0, whatsapp_1.terminate)(socket);
            }
        }));
    });
}
exports.mutateGroup = mutateGroup;
