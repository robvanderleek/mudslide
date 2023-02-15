#!/usr/bin/env node
import {program} from "commander";
import {login, logout} from "./whatsapp";
import {me, sendImage, sendLocation, sendMessage} from "./user-commands";
import {listGroups, sendGroupImage, sendGroupLocation, sendGroupMessage} from "./group-commands";

const packageJson = require('../package.json');


program.name('mudslide').version(packageJson.version);
program.option('-c, --cache <folder>', 'Override default cache folder');
program.on('option:cache', (folder) => process.env.MUDSLIDE_CACHE_FOLDER = folder);
program
    .command('login')
    .description('Login to WhatsApp')
    .action(() => login());
program
    .command('logout')
    .description('Logout from WhatsApp')
    .action(() => logout());

function configureUserCommands() {
    program
        .command('me')
        .description('Show current user details')
        .action(() => me());
    program
        .command('send <number|me> <message>')
        .description('Send message to phone number or current user')
        .action((recipient, message) => sendMessage(recipient, message));
    program
        .command('send-image <number|me> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file to phone number or current user')
        .action((recipient, file, options) => sendImage(recipient, file, options));
    program
        .command('send-location <number|me> <latitude> <longitude>')
        .description('Send location to phone number or current user')
        .action((recipient, latitude, longitude) => sendLocation(recipient, latitude, longitude));
}

function configureGroupCommands() {
    program
        .command('groups')
        .description('List all your groups')
        .action(() => listGroups());
    program
        .command('send-group <group-id> <message>')
        .description('Send message to group ID').action((id, message) => sendGroupMessage(id, message));
    program
        .command('send-group-image <group-id> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file to group ID')
        .action((id, file, options) => sendGroupImage(id, file, options));
    program
        .command('send-group-location <group-id> <latitude> <longitude>')
        .description('Send location to group ID')
        .action((id, latitude, longitude) => sendGroupLocation(id, latitude, longitude));
}

configureUserCommands();
configureGroupCommands();
program.parse(process.argv);
