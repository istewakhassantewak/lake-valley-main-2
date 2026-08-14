const test = require('node:test');
const assert = require('node:assert/strict');
const { buildContactMessagePayload } = require('../controllers/contactController');

test('attaches logged-in user details to contact payload', () => {
  const payload = buildContactMessagePayload({
    body: {
      name: 'Alice Example',
      email: 'alice@example.com',
      subject: 'Need help',
      message: 'I want to book a visit',
    },
    user: {
      _id: 'user-123',
      email: 'alice@example.com',
      displayName: 'Alice',
    },
  });

  assert.equal(payload.name, 'Alice Example');
  assert.equal(payload.userId, 'user-123');
  assert.equal(payload.userEmail, 'alice@example.com');
  assert.equal(payload.userName, 'Alice');
});

test('omits user fields for anonymous submissions', () => {
  const payload = buildContactMessagePayload({
    body: {
      name: 'Guest User',
      email: 'guest@example.com',
      subject: 'Question',
      message: 'Hello there',
    },
  });

  assert.equal(payload.userId, undefined);
  assert.equal(payload.userEmail, undefined);
  assert.equal(payload.userName, undefined);
});
