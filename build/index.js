#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const whatsapp_1 = require("./whatsapp");
const commands_1 = require("./commands");
const global_agent_1 = require("global-agent");
const packageJson = require('../package.json');
commander_1.program.name('mudslide').version(packageJson.version);
commander_1.program.option('-c, --cache <folder>', 'Override cache folder');
function increaseVerbosity(_, previous) {
    if (previous === 'silent') {
        whatsapp_1.globalOptions.logLevel = 'info';
        return 'info';
    }
    else if (previous === 'info') {
        whatsapp_1.globalOptions.logLevel = 'debug';
        return 'debug';
    }
    else {
        whatsapp_1.globalOptions.logLevel = 'trace';
        return 'trace';
    }
}
commander_1.program.option('-v, --verbose', 'Increase verbosity', increaseVerbosity, 'silent');
commander_1.program.on('option:cache', (folder) => process.env.MUDSLIDE_CACHE_FOLDER = folder);
commander_1.program.option('--proxy', 'Use HTTP/HTTPS proxy');
commander_1.program.on('option:proxy', () => {
    (0, global_agent_1.bootstrap)();
    // @ts-ignore
    global.GLOBAL_AGENT.HTTP_PROXY = process.env.HTTP_PROXY;
    // @ts-ignore
    global.GLOBAL_AGENT.HTTPS_PROXY = process.env.HTTPS_PROXY;
});
commander_1.program
    .command('login')
    .description('Login to WhatsApp')
    .action(() => (0, whatsapp_1.login)());
commander_1.program
    .command('logout')
    .description('Logout from WhatsApp')
    .action(() => (0, whatsapp_1.logout)());
function configureCommands() {
    commander_1.program
        .command('me')
        .description('Show current user details')
        .action(() => (0, commands_1.me)());
    commander_1.program
        .command('groups')
        .description('List all your groups')
        .action(() => (0, commands_1.listGroups)());
    commander_1.program
        .command('send <recipient> <message>')
        .description('Send message')
        .action((recipient, message, options) => (0, commands_1.sendMessage)(recipient, message, options));
    commander_1.program
        .command('send-image <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .description('Send image file')
        .action((recipient, file, options) => (0, commands_1.sendImage)(recipient, file, options));
    commander_1.program
        .command('send-file <recipient> <file>')
        .option('--caption <text>', 'Caption text')
        .option('--type <document|audio|video>', 'File type', 'document')
        .description('Send file')
        .action((recipient, file, options) => (0, commands_1.sendFile)(recipient, file, options));
    commander_1.program
        .command('send-location <recipient> <latitude> <longitude>')
        .allowUnknownOption()
        .description('Send location')
        .action((recipient, latitude, longitude) => (0, commands_1.sendLocation)(recipient, latitude, longitude));
    commander_1.program
        .command('send-poll <recipient> <name>')
        .option('--item <text>', 'Poll item (repeatable option)', (val, prev) => prev.concat([val]), [])
        .option('--selectable <count>', 'Number of selectable items', '1')
        .description('Send poll')
        .action((recipient, name, options) => (0, commands_1.sendPoll)(recipient, name, options));
    commander_1.program
        .command('add-to-group <group-id> <phone-number>')
        .allowUnknownOption()
        .description('Add group participant')
        .action((groupId, phoneNumber) => (0, commands_1.mutateGroup)(groupId, phoneNumber, 'add'));
    commander_1.program
        .command('remove-from-group <group-id> <phone-number>')
        .allowUnknownOption()
        .description('Remove group participant')
        .action((groupId, phoneNumber) => (0, commands_1.mutateGroup)(groupId, phoneNumber, 'remove'));
}
configureCommands();
commander_1.program.addHelpText('after', `

Examples:
  send --help
  send me 'hello world'
  send-image 123456789-987654321@g.us pizza.png --caption 'How about Pizza?'
  send-file 123456789-987654321@g.us document.pdf --caption 'Please read'
  send-file me audio.mp3 --type audio
  send-poll 123456789-987654321@g.us 'Training on Friday' --item '🏓 Yeeeessss!' --item '👎 Nope.'
  
${whatsapp_1.mudslideFooter}`);
commander_1.program.parse(process.argv);
