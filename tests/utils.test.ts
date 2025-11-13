import {expect, test} from 'vitest';
import {isValidE164PhoneNumber} from "../src/utils";

test('is valid phone number', () => {
    expect(isValidE164PhoneNumber('1234567890')).toBe(true);
    expect(isValidE164PhoneNumber('12345')).toBe(true);
    expect(isValidE164PhoneNumber('123456789012345')).toBe(true);
    expect(isValidE164PhoneNumber('1234')).toBe(false);
    expect(isValidE164PhoneNumber('1234567890123456')).toBe(false);
    expect(isValidE164PhoneNumber('123-456-7890')).toBe(false);
    expect(isValidE164PhoneNumber('+1234567890')).toBe(false);
});