import {parseGeoLocation} from "../src/whatsapp";

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