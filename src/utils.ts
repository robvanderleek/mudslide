import * as readline from "node:readline";
import signale from "signale";

const ri = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function question(query: string): Promise<string> {
    return new Promise((res) => ri.question(query, res));
}

export function isValidE164PhoneNumber(s: string): boolean {
    return /^\d{5,15}$/.test(s);
}

export async function readPhoneNumber(): Promise<string> {
    const query = 'Enter phone number in E.164 format without a plus sign (e.g., 12345678901):\n';
    let result = await question(query);
    while (!isValidE164PhoneNumber(result)) {
        signale.error('Invalid phone number.');
        result = await question(query);
    }
    ri.close();
    return result;
}