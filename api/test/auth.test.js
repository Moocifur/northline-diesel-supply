// requireAdmin must read admin status from the database, not from the login token,
// so that removing someone's admin rights takes effect immediately.
const test = require('node:test');
const assert = require('node:assert/strict');

let users;

const fakePrisma = {
    user: { findUnique: async ({ where }) => users[where.id] ?? null }
};

const prismaPath = require.resolve('../src/middleware/prisma');
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: fakePrisma };

const { requireAdmin } = require('../src/middleware/auth');

const run = async (req) => {
    let nextCalled = false;
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json() { return this; }
    };
    await requireAdmin(req, res, () => { nextCalled = true; });
    return { nextCalled, statusCode: res.statusCode };
};

test.beforeEach(() => {
    users = { admin: { isAdmin: true }, customer: { isAdmin: false } };
});

test('an admin is let through', async () => {
    const result = await run({ user: { userId: 'admin' } });
    assert.equal(result.nextCalled, true);
});

test('a regular customer is refused with 403', async () => {
    const result = await run({ user: { userId: 'customer' } });
    assert.equal(result.nextCalled, false);
    assert.equal(result.statusCode, 403);
});

test('an unknown or missing user is refused', async () => {
    assert.equal((await run({ user: { userId: 'ghost' } })).statusCode, 403);
    assert.equal((await run({})).statusCode, 403);
});

test('losing admin rights takes effect on the very next request, even with an old token', async () => {
    const req = { user: { userId: 'admin' } }; // the same decoded token both times
    assert.equal((await run(req)).nextCalled, true);

    users.admin.isAdmin = false; // an owner removes their admin rights

    const after = await run(req);
    assert.equal(after.nextCalled, false);
    assert.equal(after.statusCode, 403);
});
