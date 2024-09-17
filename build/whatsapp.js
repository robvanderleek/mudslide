"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.handleNewlines = exports.sendFileHelper = exports.sendImageHelper = exports.getWhatsAppId = exports.logout = exports.login = exports.waitForKey = exports.parseGeoLocation = exports.checkValidFile = exports.checkLoggedIn = exports.terminate = exports.initWASocket = exports.getAuthStateCacheFolderLocation = exports.mudslideFooter = exports.globalOptions = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const signale_1 = __importDefault(require("signale"));
const os = __importStar(require("os"));
const mime_1 = __importDefault(require("mime"));
exports.globalOptions = {
    logLevel: 'silent'
};
exports.mudslideFooter = '\u2B50 Please star Mudslide on GitHub! https://github.com/robvanderleek/mudslide';
function getAuthStateCacheFolderLocation() {
    if (process.env.MUDSLIDE_CACHE_FOLDER) {
        return process.env.MUDSLIDE_CACHE_FOLDER;
    }
    else {
        const homedir = os.homedir();
        if (process.platform === 'win32') {
            return path_1.default.join(homedir, 'AppData', 'Local', 'mudslide', 'Data');
        }
        else {
            return path_1.default.join(homedir, '.local', 'share', 'mudslide');
        }
    }
}
exports.getAuthStateCacheFolderLocation = getAuthStateCacheFolderLocation;
function clearCacheFolder() {
    const folder = initAuthStateCacheFolder();
    fs.readdirSync(folder).forEach(f => f.endsWith(".json") && fs.rmSync(`${folder}/${f}`));
}
function initAuthStateCacheFolder() {
    const folderLocation = getAuthStateCacheFolderLocation();
    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, { recursive: true });
        signale_1.default.log(`Created mudslide cache folder: ${folderLocation}`);
    }
    return folderLocation;
}
function initWASocket(printQR = true, message = undefined) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(initAuthStateCacheFolder());
        const os = process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'Windows' : 'Linux';
        const socket = (0, baileys_1.default)({
            version: [2, 3000, 1015901307],
            logger: (0, pino_1.default)({ level: exports.globalOptions.logLevel }),
            auth: state,
            printQRInTerminal: printQR,
            browser: [os, 'Chrome', '10.15.0'],
            generateHighQualityLinkPreview: true,
            getMessage: (_) => __awaiter(this, void 0, void 0, function* () {
                return {
                    conversation: message
                };
            })
        });
        socket.ev.on('creds.update', () => __awaiter(this, void 0, void 0, function* () { return yield saveCreds(); }));
        return socket;
    });
}
exports.initWASocket = initWASocket;
function terminate(socket, waitSeconds = 1) {
    if (waitSeconds > 0) {
        signale_1.default.await(`Closing WA connection, waiting for ${waitSeconds} second(s)...`);
    }
    setTimeout(() => {
        socket.end(undefined);
        socket.ws.close();
        process.exit();
    }, waitSeconds * 1000);
    console.info(exports.mudslideFooter);
}
exports.terminate = terminate;
function checkLoggedIn() {
    if (!fs.existsSync(path_1.default.join(initAuthStateCacheFolder(), 'creds.json'))) {
        signale_1.default.error('Not logged in');
        process.exit(1);
    }
}
exports.checkLoggedIn = checkLoggedIn;
function checkValidFile(path) {
    if (!(fs.existsSync(path) && fs.lstatSync(path).isFile())) {
        signale_1.default.error(`Could not read image file: ${path}`);
        process.exit(1);
    }
}
exports.checkValidFile = checkValidFile;
function parseGeoLocation(latitude, longitude) {
    const latitudeFloat = parseFloat(latitude);
    const longitudeFloat = parseFloat(longitude);
    if (isNaN(latitudeFloat) || isNaN(longitudeFloat)) {
        signale_1.default.error(`Invalid geo location: ${latitude}, ${longitude}`);
        process.exit(1);
    }
    return [parseFloat(latitudeFloat.toFixed(7)), parseFloat(longitudeFloat.toFixed(7))];
}
exports.parseGeoLocation = parseGeoLocation;
function waitForKey(message) {
    return __awaiter(this, void 0, void 0, function* () {
        signale_1.default.pause(message);
        process.stdin.setRawMode(true);
        return new Promise(resolve => process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            resolve(undefined);
        }));
    });
}
exports.waitForKey = waitForKey;
function login(waitForWA = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!waitForWA) {
            signale_1.default.info('In the WhatsApp mobile app go to "Settings > Connected Devices > ');
            signale_1.default.info('Connect Device" and scan the QR code below');
        }
        const socket = yield initWASocket();
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut) {
                    yield login(true);
                }
                else {
                    signale_1.default.error('Device was disconnected from WhatsApp, use "logout" command first');
                    return;
                }
            }
            else if (connection === 'open') {
                signale_1.default.success('Logged in');
                if (waitForWA) {
                    yield waitForKey("Wait until WhatsApp finishes connecting, then press any key to exit");
                    terminate(socket);
                }
                else {
                    terminate(socket);
                }
            }
        }));
    });
}
exports.login = login;
function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        checkLoggedIn();
        const socket = yield initWASocket(false);
        socket.ev.on('connection.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { connection } = update;
            if (update.connection === undefined && update.qr) {
                clearCacheFolder();
                signale_1.default.success(`Logged out`);
                terminate(socket);
            }
            if (connection === 'open') {
                yield socket.logout();
                clearCacheFolder();
                signale_1.default.success(`Logged out`);
                terminate(socket);
            }
        }));
        process.on('exit', clearCacheFolder);
    });
}
exports.logout = logout;
function getWhatsAppId(socket, recipient) {
    return __awaiter(this, void 0, void 0, function* () {
        if (recipient.startsWith('+')) {
            recipient = recipient.substring(1);
        }
        if (recipient.endsWith('@s.whatsapp.net') || recipient.endsWith('@g.us')) {
            return recipient;
        }
        else if (recipient === 'me') {
            const user = yield socket.user;
            if (user) {
                const phoneNumber = user.id.substring(0, user.id.indexOf(':'));
                return `${phoneNumber}@s.whatsapp.net`;
            }
        }
        return `${recipient}@s.whatsapp.net`;
    });
}
exports.getWhatsAppId = getWhatsAppId;
function sendImageHelper(socket, whatsappId, filePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = { image: fs.readFileSync(filePath), caption: handleNewlines(options.caption) };
        yield socket.sendMessage(whatsappId, payload);
        signale_1.default.success('Done');
        terminate(socket, 3);
    });
}
exports.sendImageHelper = sendImageHelper;
function sendFileHelper(socket, whatsappId, filePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            mimetype: mime_1.default.getType(filePath),
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
                payload['fileName'] = path_1.default.basename(filePath);
        }
        yield socket.sendMessage(whatsappId, payload);
        signale_1.default.success('Done');
        terminate(socket, 3);
    });
}
exports.sendFileHelper = sendFileHelper;
function handleNewlines(s) {
    if (s) {
        return s.replace(/\\n/g, '\n');
    }
}
exports.handleNewlines = handleNewlines;
