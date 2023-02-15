"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_1 = require("../src/whatsapp");
test('parse geo location', () => {
    const result = (0, whatsapp_1.parseGeoLocation)('5', '10');
    expect(result[0]).toBe(5);
    expect(result[1]).toBe(10);
});
