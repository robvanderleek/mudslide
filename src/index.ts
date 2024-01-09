#!/usr/bin/env node
import {program} from "commander";
import {globalOptions, login, logout, mudslideFooter} from "./whatsapp";
import {listGroups, me, mutateGroup, sendFile, sendImage, sendLocation, sendMessage, sendPoll} from "./commands";
import {bootstrap} from 'global-agent';

const packageJson = require('../package.json');

program.name('mudslide').version(packageJson.version);
program.option('-c, --cache <folder>', 'Override cache folder');

function increaseVerbosity(_: string, previous: string) {
    if (previous === 'silent') {
        globalOptions.logLevel = 'info';
        return 'info';
    } else if (previous === 'info') {
        globalOptions.logLevel = 'debug';
        return 'debug';
    } else {
        globalOptions.logLevel = 'trace';
        return 'trace';
    }
}

program.option('-v, --verbose', 'Increase verbosity', increaseVerbosity, 'silent');
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
        .action((recipient, message, options) => sendMessage(recipient, message, options));
    program
        .command('send-image <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file')
        .action((recipient, file, options) => sendImage(recipient, file, options));
    program
        .command('send-file <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .option('--type <document|audio|video>', 'File type', 'document')
        .description('Send file')
        .action((recipient, file, options) => sendFile(recipient, file, options));
    program
        .command('send-location <recipient> <latitude> <longitude>')
        .allowUnknownOption()
        .description('Send location')
        .action((recipient, latitude, longitude) => sendLocation(recipient, latitude, longitude));
    program
        .command('send-poll <recipient> <name>')
        .option('--item <text>', 'Poll item (repeatable option)', (val, prev: Array<string>) => prev.concat([val]), [])
        .option('--selectable <count>', 'Number of selectable items', '1')
        .description('Send poll')
        .action((recipient, name, options) => sendPoll(recipient, name, options));
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
program.addHelpText('after', `

Examples:
  send --help
  send me 'hello world'
  send-image 123456789-987654321@g.us pizza.png --caption 'How about Pizza?'
  send-file 123456789-987654321@g.us document.pdf --caption 'Please read'
  send-file me audio.mp3 --type audio
  send-poll 123456789-987654321@g.us 'Training on Friday' --item '🏓 Yeeeessss!' --item '👎 Nope.'
  
${mudslideFooter}`);

program.parse(process.argv);