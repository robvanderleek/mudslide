#!/usr/bin/env node
import {program} from "commander";
import {getAuthStateCacheFolderLocation, login, logout} from "./whatsapp";
import {
    listGroups,
    me,
    sendFile,
    sendGroupFile,
    sendGroupImage,
    sendGroupLocation,
    sendGroupMessage,
    sendImage,
    sendLocation,
    sendMessage
} from "./commands";

const packageJson = require('../package.json');


program.name('mudslide').version(packageJson.version);
program.option('-c, --cache <folder>', `Override default cache folder (default: ${getAuthStateCacheFolderLocation()} )`);
program.on('option:cache', (folder) => process.env.MUDSLIDE_CACHE_FOLDER = folder);
program
    .command('login')
    .description('Login to WhatsApp')
    .action(() => login());
program
    .command('logout')
    .description('Logout from WhatsApp')
    .action(() => logout());

function configureCommands() {
    program
        .command('me')
        .description('Show current user details')
        .action(() => me());
    program
        .command('groups')
        .description('List all your groups')
        .action(() => listGroups());
    program
        .command('send <recipient> <message>')
        .description('Send message')
        .action((recipient, message) => sendMessage(recipient, message));
    program
        .command('send-image <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file')
        .action((recipient, file, options) => sendImage(recipient, file, options));
    program
        .command('send-file <recipient> <file>')
        .description('Send file')
        .action((recipient, file) => sendFile(recipient, file));
    program
        .command('send-location <recipient> <latitude> <longitude>')
        .allowUnknownOption()
        .description('Send location')
        .action((recipient, latitude, longitude) => sendLocation(recipient, latitude, longitude));
}

function configureGroupCommands() {
    program
        .command('send-group <group-id> <message>')
        .description('[DEPRECATED] Send message to group ID').action((id, message) => sendGroupMessage(id, message));
    program
        .command('send-group-image <group-id> <file>')
        .option('--caption <text>', 'Caption text')
        .description('[DEPRECATED] Send image file to group ID')
        .action((id, file, options) => sendGroupImage(id, file, options));
    program
        .command('send-group-location <group-id> <latitude> <longitude>')
        .allowUnknownOption()
        .description('[DEPRECATED] Send location to group ID')
        .action((id, latitude, longitude) => sendGroupLocation(id, latitude, longitude));
    program
        .command('send-group-file <group-id> <file>')
        .description('[DEPRECATED] Send file to group ID')
        .action((id, file) => sendGroupFile(id, file));
}

configureCommands();
configureGroupCommands();
program.parse(process.argv);
