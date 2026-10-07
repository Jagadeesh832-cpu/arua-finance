import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { normalizeExpense } from '../user.controller.js';
import { User } from '../user.model.js';

console.log('--- RUNNING EXPENSE CRUD & CAST ERROR VERIFICATION SUITE ---');

// TEST 1: The Exact Failing Case
console.log('Test 1: Exact Failing Case Normalization');
const failingCaseInput = {
  _id: 'exp_1791400384874_vkifn',
  description: 'shopping',
  amount: 2000,
  category: 'Shopping',
  paymentMethod: 'UPI',
  date: '2026-10-07'
};

const normalizedFailingCase = normalizeExpense(failingCaseInput);

assert.ok(normalizedFailingCase, 'Normalized expense should be non-null');
assert.equal(normalizedFailingCase.description, 'shopping');
assert.equal(normalizedFailingCase.amount, 2000);
assert.equal(normalizedFailingCase.category, 'Shopping');
assert.equal(normalizedFailingCase.paymentMethod, 'UPI');
assert.equal(normalizedFailingCase.expenseId, 'exp_1791400384874_vkifn', 'Original custom string ID preserved in expenseId');
assert.ok(normalizedFailingCase._id instanceof mongoose.Types.ObjectId, '_id must be a valid Mongoose ObjectId');
assert.ok(mongoose.Types.ObjectId.isValid(normalizedFailingCase._id), '_id must be valid ObjectId');

// TEST 2: Mongoose Schema instantiation with normalized object (Zero CastError)
console.log('Test 2: Mongoose Embedded Instantiation');
const mockUserDoc = new User({
  name: 'Investor Test',
  email: 'test@arua.finance',
  expenses: [normalizedFailingCase]
});

assert.equal(mockUserDoc.expenses.length, 1);
assert.equal(mockUserDoc.expenses[0].description, 'shopping');
assert.equal(mockUserDoc.expenses[0].amount, 2000);
assert.ok(mockUserDoc.expenses[0]._id instanceof mongoose.Types.ObjectId);
assert.equal(mockUserDoc.expenses[0].expenseId, 'exp_1791400384874_vkifn');

// TEST 3: Fresh Expense Creation without _id
console.log('Test 3: Clean Expense Creation without client _id');
const freshExpense = {
  description: 'Dinner with friends',
  amount: 1450.50,
  category: 'Food & Dining',
  paymentMethod: 'Credit Card',
  date: '2026-10-08'
};
const normalizedFresh = normalizeExpense(freshExpense);
assert.equal(normalizedFresh.amount, 1450.50, 'Decimal amount supported');
assert.ok(normalizedFresh._id instanceof mongoose.Types.ObjectId);

// TEST 4: Existing standard 24-character ObjectId preservation
console.log('Test 4: Existing ObjectId Preservation');
const existingId = new mongoose.Types.ObjectId();
const existingExpense = {
  _id: existingId.toString(),
  description: 'Electricity bill',
  amount: 3200,
  category: 'Utilities',
  paymentMethod: 'Net Banking',
  date: '2026-10-01'
};
const normalizedExisting = normalizeExpense(existingExpense);
assert.equal(normalizedExisting._id.toString(), existingId.toString(), 'Existing ObjectId preserved');

// TEST 5: Multiple Expenses and Backward Compatibility
console.log('Test 5: Multiple expenses batch normalization');
const rawBatch = [
  failingCaseInput,
  freshExpense,
  existingExpense,
  { id: 'exp_legacy_99', description: 'Petrol', amount: 500, category: 'Transport', paymentMethod: 'Cash' }
];

const normalizedBatch = rawBatch.map(normalizeExpense);
mockUserDoc.expenses = normalizedBatch;

assert.equal(mockUserDoc.expenses.length, 4, 'All 4 expenses instantiated without CastError');
assert.equal(mockUserDoc.expenses[3].expenseId, 'exp_legacy_99');

console.log('\n✅ ALL EXPENSE TESTS PASSED WITH 0 CAST ERRORS!\n');
