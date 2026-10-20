const test = require('node:test');
const assert = require('node:assert/strict');
const { allowedTransitions, canTransition } = require('../src/services/orderStatus');

test('a paid order can be fulfilled or cancelled', () => {
    assert.deepEqual(allowedTransitions('PAID'), ['FULFILLED', 'CANCELLED']);
    assert.equal(canTransition('PAID', 'FULFILLED'), true);
    assert.equal(canTransition('PAID', 'CANCELLED'), true);
});

test('fulfilled and cancelled orders are final', () => {
    assert.deepEqual(allowedTransitions('FULFILLED'), []);
    assert.deepEqual(allowedTransitions('CANCELLED'), []);
    assert.equal(canTransition('FULFILLED', 'CANCELLED'), false);
    assert.equal(canTransition('CANCELLED', 'PAID'), false);
});

test('orders cannot skip steps backwards or to made-up statuses', () => {
    assert.equal(canTransition('PAID', 'PENDING_PAYMENT'), false);
    assert.equal(canTransition('PAID', 'SHIPPED'), false);
    assert.equal(canTransition('NOT_A_STATUS', 'PAID'), false);
    assert.deepEqual(allowedTransitions('NOT_A_STATUS'), []);
});
