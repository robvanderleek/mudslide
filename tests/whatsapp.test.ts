import {expect, test} from 'vitest';
import {
    checkNumberExistsOnWhatsApp,
    getWhatsAppId,
    handleNewlines,
    isLoggedOutDisconnect,
    isOwnParticipant,
    parseGeoLocation
} from "../src/whatsapp";

test('get whatsapp id', async () => {
    expect(await getWhatsAppId({}, '3161234567890')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '3161234567890@s.whatsapp.net')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '123456789-987654321@g.us')).toBe('123456789-987654321@g.us');
    expect(await getWhatsAppId({user: {id: '3161234567890:1'}}, 'me')).toBe('3161234567890@s.whatsapp.net');
    expect(await getWhatsAppId({}, '+3161234567890')).toBe('3161234567890@s.whatsapp.net');
})

test('parse geo location', () => {
    const result = parseGeoLocation('5', '10');

    expect(result[0]).toBe(5);
    expect(result[1]).toBe(10);
})

test('parse geo location, with enough precision', () => {
    const result = parseGeoLocation('33.8677835', '63.9863332');

    expect(result[0]).toBe(33.8677835);
    expect(result[1]).toBe(63.9863332);
})

test('parse geo location, negative values (southern hemisphere', () => {
    const result = parseGeoLocation('-33.8677835', '-63.9863332');

    expect(result[0]).toBe(-33.8677835);
    expect(result[1]).toBe(-63.9863332);
})

test('parse geo location, round coords', () => {
    const result = parseGeoLocation('5.123456789', '10.123456789');

    expect(result[0]).toBe(5.1234568);
    expect(result[1]).toBe(10.1234568);
})

test('handle newlines', () => {
    expect(handleNewlines('hello world')).toBe('hello world');
    expect(handleNewlines('hello\\nworld')).toBe('hello\nworld');
    expect(handleNewlines('hello\\nworld\\n')).toBe('hello\nworld\n');
    expect(handleNewlines()).toBeUndefined();
})

test('check number exists on whatsapp', async () => {
    const socket = {onWhatsApp: async () => [{jid: '3161234567890@s.whatsapp.net', exists: true}]};

    expect(await checkNumberExistsOnWhatsApp(socket, '3161234567890@s.whatsapp.net')).toBe(true);
})

test('detect logged-out disconnect', () => {
    expect(isLoggedOutDisconnect({error: {output: {statusCode: 401}}})).toBe(true);
    expect(isLoggedOutDisconnect({error: {output: {statusCode: 500}}})).toBe(false);
})

test('is own participant, matches on phone number', () => {
    const socket = {user: {id: '3161234567890:1@s.whatsapp.net', lid: undefined}};
    const participant = {attrs: {jid: '999@lid', phone_number: '3161234567890@s.whatsapp.net'}};

    expect(isOwnParticipant(socket, participant)).toBe(true);
})

test('is own participant, matches on lid when phone number is missing', () => {
    const socket = {user: {id: '3161234567890:1@s.whatsapp.net', lid: '999:1@lid'}};
    const participant = {attrs: {jid: '999@lid'}};

    expect(isOwnParticipant(socket, participant)).toBe(true);
})

test('is own participant, no match', () => {
    const socket = {user: {id: '3161234567890:1@s.whatsapp.net', lid: '999:1@lid'}};
    const participant = {attrs: {jid: '111@lid', phone_number: '3169999999999@s.whatsapp.net'}};

    expect(isOwnParticipant(socket, participant)).toBe(false);
})
