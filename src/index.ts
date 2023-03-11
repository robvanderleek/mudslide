#!/usr/bin/env node
import {program} from "commander";
import {login, logout} from "./whatsapp";
import {listGroups, me, mutateGroup, sendFile, sendImage, sendLocation, sendMessage} from "./commands";
import {bootstrap} from 'global-agent';

const packageJson = require('../package.json');


program.name('mudslide').version(packageJson.version);
program.option('-c, --cache <folder>', 'Override cache folder');
program.on('option:cache', (folder) => process.env.MUDSLIDE_CACHE_FOLDER = folder);
program.option('--proxy', 'Use HTTP/HTTPS proxy');
program.on('option:proxy', () => {
    bootstrap();
    // @ts-ignore
    global.GLOBAL_AGENT.HTTP_PROXY = process.env.HTTP_PROXY;
    // @ts-ignore
    global.GLOBAL_AGENT.HTTPS_PROXY = process.env.HTTPS_PROXY;
});
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
        .option('-b, --button <text>', 'Button text (repeatable option)', (val, prev: Array<string>) => prev.concat([val]), [])
        .option('--footer <text>', 'Footer text')
        .action((recipient, message, options) => sendMessage(recipient, message, options));
    program
        .command('send-image <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file')
        .action((recipient, file, options) => sendImage(recipient, file, options));
    program
        .command('send-file <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send file')
        .action((recipient, file, options) => sendFile(recipient, file, options));
    program
        .command('send-location <recipient> <latitude> <longitude>')
        .allowUnknownOption()
        .description('Send location')
        .action((recipient, latitude, longitude) => sendLocation(recipient, latitude, longitude));
    program
        .command('add-to-group <group-id> <phone-number>')
        .allowUnknownOption()
        .description('Add group participant')
        .action((groupId, phoneNumber) => mutateGroup(groupId, phoneNumber, 'add'));
    program
        .command('remove-from-group <group-id> <phone-number>')
        .allowUnknownOption()
        .description('Remove group participant')
        .action((groupId, phoneNumber) => mutateGroup(groupId, phoneNumber, 'remove'));
}

configureCommands();
program.parse(process.argv);
