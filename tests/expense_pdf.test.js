import assert from 'node:assert/strict';
import mongoose from '../backend/node_modules/mongoose/index.js';
import { generateExpensePdf } from '../frontend/src/helper/generateExpensePdf.js';
import { normalizeExpense } from '../backend/user.controller.js';
import { User } from '../backend/user.model.js';

console.log('--- RUNNING EXPENSE PDF PROOF GENERATION TEST SUITE ---');

// TEST 1: Generate PDF for exact saved expense
console.log('Test 1: Generate PDF for verified saved expense');
const savedExpense = {
  _id: '670392e2764b8a1c90123456',
  expenseId: 'exp_1791400384874_vkifn',
  description: 'shopping',
  amount: 2000,
  category: 'Shopping',
  paymentMethod: 'UPI',
  date: '2026-10-07'
};

const user = {
  name: 'Jagadeesh',
  email: 'jagadeesh@arua.finance'
};

const result = generateExpensePdf(savedExpense, user);

assert.ok(result, 'Result should be returned');
assert.equal(result.success, true, 'Generation should succeed');
assert.equal(
  result.filename,
  `AruaFinance_Expense_${savedExpense._id}.pdf`,
  'Filename must follow format AruaFinance_Expense_<expenseId>.pdf'
);
assert.ok(result.doc, 'jsPDF doc object must be present');
const pdfBuffer = result.doc.output('arraybuffer');
assert.ok(pdfBuffer.byteLength > 1000, 'PDF buffer must contain binary PDF content');

// TEST 2: Rejection on unsaved / failed expense (missing _id / expenseId / id)
console.log('Test 2: Rejection on unsaved / failed expense without MongoDB ID');
assert.throws(
  () => {
    generateExpensePdf(
      { description: 'failed draft', amount: 500, category: 'Shopping' },
      user
    );
  },
  /Cannot generate proof: Expense has not been confirmed or saved in MongoDB/
);

assert.throws(
  () => {
    generateExpensePdf(null, user);
  },
  /Cannot generate proof: Expense has not been confirmed or saved in MongoDB/
);

// TEST 3: Verification key format and human-readable ID
console.log('Test 3: Verification of Reference Key and Filename convention');
const customIdExpense = {
  _id: '670399aa1234567890abcdef',
  description: 'Annual Cloud Hosting',
  amount: 15499.75,
  category: 'Utilities',
  paymentMethod: 'Credit Card',
  date: '2026-10-08'
};

const customResult = generateExpensePdf(customIdExpense, { name: 'Arua Finance Admin' });
assert.equal(customResult.success, true);
assert.equal(customResult.filename, 'AruaFinance_Expense_670399aa1234567890abcdef.pdf');

// TEST 4: End-to-End Mongoose Integration Pipeline
console.log('Test 4: End-to-end flow from Mongoose saved expense to PDF generation');
const rawInput = {
  _id: 'exp_1791400384874_vkifn',
  description: 'shopping',
  amount: 2000,
  category: 'Shopping',
  paymentMethod: 'UPI',
  date: '2026-10-07'
};

const normalized = normalizeExpense(rawInput);
const testUser = new User({
  name: 'Jagadeesh',
  email: 'investor@arua.finance',
  expenses: [normalized]
});

const mongoSavedExpense = testUser.expenses[0].toObject();
assert.ok(mongoSavedExpense._id, 'Mongoose embedded expense has _id');
assert.ok(mongoose.Types.ObjectId.isValid(mongoSavedExpense._id));

const mongoPdfResult = generateExpensePdf(mongoSavedExpense, testUser);
assert.equal(mongoPdfResult.success, true);
assert.equal(mongoPdfResult.filename, `AruaFinance_Expense_${mongoSavedExpense._id}.pdf`);

console.log('\n✅ ALL EXPENSE PDF TESTS PASSED SUCCESSFULLY!\n');
