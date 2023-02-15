import {parseGeoLocation} from "../src/whatsapp";

test('parse geo location', () => {
    const  result = parseGeoLocation('5', '10');

    expect(result[0]).toBe(5);
    expect(result[1]).toBe(10);
})