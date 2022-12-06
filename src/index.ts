#!/usr/bin/env node
import {program} from "commander";
import {listGroups, login, logout, me, sendGroupMessage, sendMessage} from "./whatsapp";


program.name('wacli').version('0.1.0');
program
    .command('login')
    .description('Login to WhatsApp')
    .action(() => login());
program
    .command('logout')
    .description('Logout from WhatsApp')
    .action(() => logout());
program
    .command('send <number|me> <message>')
    .description('Send message to phone number or current user')
    .action((recipient, message) => sendMessage(recipient, message));
program
    .command('send-group <group-id> <message>')
    .description('Send message to group ID').action((id, message) => sendGroupMessage(id, message));
program
    .command('groups')
    .description('List all your groups')
    .action(() => listGroups());
program
    .command('me')
    .description('Show current user details')
    .action(() => me());
program.parse(process.argv);
