import {parseGeoLocation} from "../src/whatsapp";

test('parse geo location', () => {
    const  result = parseGeoLocation('5', '10');

    expect(result[0]).toBe(5);
    expect(result[1]).toBe(10);
})

test('parse geo location, round coords', () => {
    const  result = parseGeoLocation('5.123456789', '10.123456789');

    expect(result[0]).toBe(5.12346);
    expect(result[1]).toBe(10.12346);
})