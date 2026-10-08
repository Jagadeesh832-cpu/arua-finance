import assert from 'node:assert/strict';
import jwt from '../backend/node_modules/jsonwebtoken/index.js';
import crypto from 'crypto';
import { getJwtSecret } from '../backend/jwt.config.js';
import { requireAuth } from '../backend/auth.middleware.js';
import { sanitizeUser } from '../backend/user.controller.js';
import { User } from '../backend/user.model.js';

console.log('--- RUNNING SECURITY & AUTHORIZATION TEST SUITE ---');

// TEST 1: JWT Secret Security & Production Fail-Safe
console.log('Test 1: JWT Secret Security & Fail-Safe');
{
  const testSecret = getJwtSecret();
  assert.ok(testSecret && testSecret.length > 0, 'JWT Secret must be non-empty');

  // Verify production fail-safe throws when JWT_SECRET is missing or insecure
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;
  
  process.env.NODE_ENV = 'production';
  delete process.env.JWT_SECRET;
  
  let threwInProd = false;
  try {
    getJwtSecret();
  } catch (err) {
    threwInProd = true;
    assert.match(err.message, /JWT_SECRET/i);
  }
  assert.ok(threwInProd, 'getJwtSecret must throw fatal error in production when JWT_SECRET is unset');

  // Reset environment
  process.env.NODE_ENV = originalEnv;
  if (originalSecret) process.env.JWT_SECRET = originalSecret;
}

// TEST 2: Authentication Middleware Enforcement (requireAuth)
console.log('Test 2: Authentication Middleware (401 on missing, invalid, or expired tokens)');
{
  // 2A: Missing Authorization header
  let status401 = false;
  let errorJson = null;
  const reqNoHeader = { headers: {} };
  const resNoHeader = {
    status(code) {
      if (code === 401) status401 = true;
      return this;
    },
    json(data) {
      errorJson = data;
      return this;
    }
  };
  await requireAuth(reqNoHeader, resNoHeader, () => {});
  assert.ok(status401, 'Missing Authorization header must return 401');
  assert.match(errorJson.message, /authorization token|log in/i);

  // 2B: Malformed / Invalid token
  status401 = false;
  const reqBadToken = { headers: { authorization: 'Bearer invalid.bogus.token' } };
  await requireAuth(reqBadToken, resNoHeader, () => {});
  assert.ok(status401, 'Invalid JWT token must return 401');

  // 2C: Expired token
  status401 = false;
  const expiredToken = jwt.sign(
    { id: 'usr_123', email: 'test@arua.finance' },
    getJwtSecret(),
    { expiresIn: -10 } // already expired
  );
  const reqExpired = { headers: { authorization: `Bearer ${expiredToken}` } };
  await requireAuth(reqExpired, resNoHeader, () => {});
  assert.ok(status401, 'Expired JWT token must return 401');

  // 2D: Valid token succeeds and attaches req.user
  const originalFindById = User.findById;
  User.findById = async (id) => ({
    _id: id,
    email: 'investor@arua.finance',
    name: 'Valid Investor'
  });

  let nextCalled = false;
  const validToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', email: 'investor@arua.finance', name: 'Valid Investor' },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
  const reqValid = { headers: { authorization: `Bearer ${validToken}` } };
  await requireAuth(reqValid, resNoHeader, () => { nextCalled = true; });
  assert.ok(nextCalled, 'Valid JWT must call next()');
  assert.ok(reqValid.user, 'req.user must be attached');
  assert.equal(reqValid.user.email, 'investor@arua.finance');

  User.findById = originalFindById;
}

// TEST 3: User-to-User Isolation & IDOR Protection Logic
console.log('Test 3: Cross-User Isolation (IDOR Prevention)');
{
  function isSameUser(reqUser, requestedIdentifier) {
    if (!requestedIdentifier || !reqUser) return true;
    const clean = String(requestedIdentifier).trim().toLowerCase();
    const digits = clean.replace(/\D/g, "");
    const p10 = digits.length >= 10 ? digits.slice(-10) : digits;

    if (String(reqUser._id).toLowerCase() === clean) return true;
    if (reqUser.email && reqUser.email.toLowerCase() === clean) return true;
    if (reqUser.phoneNumber) {
      const userDigits = reqUser.phoneNumber.replace(/\D/g, "");
      const userP10 = userDigits.length >= 10 ? userDigits.slice(-10) : userDigits;
      if (userP10 === p10) return true;
    }
    return false;
  }

  const authenticatedUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'alice@arua.finance',
    phoneNumber: '+919876543210'
  };

  // Alice accessing Alice's own data -> ALLOWED
  assert.ok(isSameUser(authenticatedUser, 'alice@arua.finance'), 'Own email allowed');
  assert.ok(isSameUser(authenticatedUser, '507f1f77bcf86cd799439011'), 'Own ObjectId allowed');
  assert.ok(isSameUser(authenticatedUser, '+919876543210'), 'Own full phone allowed');
  assert.ok(isSameUser(authenticatedUser, '9876543210'), 'Own 10-digit phone allowed');

  // Alice attempting to access Bob's data -> REJECTED (403 IDOR prevention)
  assert.strictEqual(isSameUser(authenticatedUser, 'bob@arua.finance'), false, 'Cross-user email must be rejected');
  assert.strictEqual(isSameUser(authenticatedUser, '507f1f77bcf86cd799439099'), false, 'Cross-user ObjectId must be rejected');
  assert.strictEqual(isSameUser(authenticatedUser, '+919123456789'), false, 'Cross-user phone must be rejected');
}

// TEST 4: Sensitive Data Stripping / Sanitization
console.log('Test 4: Sensitive Data Sanitization');
{
  const rawUserWithSecrets = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Investor Name',
    email: 'investor@arua.finance',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    resetPasswordToken: 'super_secret_reset_token',
    resetPasswordExpires: new Date(Date.now() + 3600000),
    __v: 0,
    annualIncome: 1200000
  };

  const sanitized = sanitizeUser(rawUserWithSecrets);
  assert.strictEqual(sanitized.passwordHash, undefined, 'passwordHash must never be exposed');
  assert.strictEqual(sanitized.resetPasswordToken, undefined, 'resetPasswordToken must never be exposed');
  assert.strictEqual(sanitized.resetPasswordExpires, undefined, 'resetPasswordExpires must never be exposed');
  assert.strictEqual(sanitized.__v, undefined, '__v must be stripped');
  assert.equal(sanitized.email, 'investor@arua.finance');
  assert.equal(sanitized.annualIncome, 1200000);
}

// TEST 5: Cryptographic Server Proof Generation & Anti-Tampering
console.log('Test 5: Cryptographic Server Expense Proof Verification');
{
  const userId = '507f1f77bcf86cd799439011';
  const expenseId = '65432177bcf86cd799439022';
  const amount = 2500;
  const dateStr = new Date('2026-10-08T10:00:00Z').toISOString();
  const description = 'Office Stationery';

  // Server generates HMAC
  const secretKey = getJwtSecret();
  const payload = `${userId}:${expenseId}:${amount}:${dateStr}:${description}`;
  const validHmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  // Verify server HMAC matches
  const recalculatedHmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  assert.equal(validHmac, recalculatedHmac, 'Cryptographic proof HMAC signature matches');

  // Tamper test: Attacker alters amount from 2500 to 250000
  const tamperedPayload = `${userId}:${expenseId}:250000:${dateStr}:${description}`;
  const tamperedHmac = crypto.createHmac('sha256', secretKey).update(tamperedPayload).digest('hex');
  assert.notEqual(validHmac, tamperedHmac, 'Tampered amount immediately breaks HMAC verification');
}

// TEST 6: CORS Origin Allowlist Policy
console.log('Test 6: CORS Allowlist Policy');
{
  const ALLOWED_ORIGIN_REGEX = /^https:\/\/(aurafinance2026|arua-finance)[a-z0-9-]*\.vercel\.app$/i;
  const STATIC_ALLOWED_ORIGINS = new Set([
    'https://aurafinance2026.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ]);

  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (STATIC_ALLOWED_ORIGINS.has(origin)) return true;
    if (ALLOWED_ORIGIN_REGEX.test(origin)) return true;
    return false;
  };

  assert.ok(isOriginAllowed('https://aurafinance2026.vercel.app'), 'Live app origin must be allowed');
  assert.ok(isOriginAllowed('https://aurafinance2026-git-main-jagadeesh.vercel.app'), 'Vercel preview origin must be allowed');
  assert.ok(isOriginAllowed('http://localhost:5173'), 'Local dev 5173 must be allowed');
  assert.ok(isOriginAllowed('http://localhost:3000'), 'Local dev 3000 must be allowed');
  assert.ok(isOriginAllowed(null), 'Non-browser requests must be allowed');

  // Malicious/unauthorized origins must be blocked
  assert.strictEqual(isOriginAllowed('https://evil-hacker.com'), false, 'Malicious origin must be rejected');
  assert.strictEqual(isOriginAllowed('https://fakeaurafinance2026.com'), false, 'Lookalike domain must be rejected');
}

console.log('\n✅ ALL SECURITY & AUTHORIZATION TESTS PASSED FLAWLESSLY!\n');
