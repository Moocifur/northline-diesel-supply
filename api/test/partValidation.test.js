const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePart } = require('../src/services/partValidation');

const validBody = {
    partNumber: ' INJ-1001 ',
    description: 'Common Rail Injector',
    brand: 'Kestrel',
    category: 'Fuel Injectors',
    price: '149.5',
    coreCharge: '',
    quantityOnHand: '12',
    images: [' https://example.com/a.jpg ', '']
};

test('a full valid body is trimmed and normalized', () => {
    const { errors, data } = validatePart(validBody);
    assert.deepEqual(errors, []);
    assert.equal(data.partNumber, 'INJ-1001');
    assert.equal(data.price, '149.50');
    assert.equal(data.coreCharge, null); // '' clears the field
    assert.equal(data.quantityOnHand, 12);
    assert.deepEqual(data.images, ['https://example.com/a.jpg']);
});

test('creating requires part number, description, brand and category', () => {
    const { errors } = validatePart({});
    assert.equal(errors.length, 4);
});

test('bad prices and quantities are rejected', () => {
    assert.ok(validatePart({ ...validBody, price: '-5' }).errors.length > 0);
    assert.ok(validatePart({ ...validBody, price: 'abc' }).errors.length > 0);
    assert.ok(validatePart({ ...validBody, quantityOnHand: '1.5' }).errors.length > 0);
    assert.ok(validatePart({ ...validBody, quantityOnHand: '-1' }).errors.length > 0);
});

test('partial updates only include the fields that were sent', () => {
    const { errors, data } = validatePart({ active: false }, { partial: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(data, { active: false });
});

test('partial updates still reject blank required fields', () => {
    const { errors } = validatePart({ brand: '   ' }, { partial: true });
    assert.equal(errors.length, 1);
});

test('active must be a real boolean', () => {
    assert.ok(validatePart({ active: 'yes' }, { partial: true }).errors.length > 0);
});
