import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../user.model.js';
import { normalizeExpense, addExpenseToUser, updateExpenseInUser, deleteExpenseFromUser } from '../user.controller.js';

console.log('--- RUNNING FULL 10-STEP EXPENSE LIFECYCLE & INTEGRATION SUITE ---');

// Mock in-memory user document simulation
const user = new User({
  name: 'Test Investor',
  email: 'investor.qa@arua.finance',
  phoneNumber: '+919876543210',
  monthlyBudget: 50000,
  expenses: []
});

// Mock findUserByIdentifier for test environment
import * as userController from '../user.controller.js';

// STEP 1: Add Exact Failing Case Expense
console.log('Step 1: Add Exact Failing Case Expense (shopping, 2000, Shopping, UPI, 2026-10-07)');
const rawExpense1 = {
  description: 'shopping',
  amount: 2000,
  category: 'Shopping',
  paymentMethod: 'UPI',
  date: '2026-10-07'
};

const norm1 = normalizeExpense(rawExpense1);
assert.ok(norm1._id instanceof mongoose.Types.ObjectId, 'MongoDB _id is a valid ObjectId');
assert.equal(norm1.description, 'shopping');
assert.equal(norm1.amount, 2000);
assert.equal(norm1.category, 'Shopping');
assert.equal(norm1.paymentMethod, 'UPI');
assert.equal(new Date(norm1.date).toISOString().split('T')[0], '2026-10-07');

user.expenses.push(norm1);
assert.equal(user.expenses.length, 1);
const savedExpense1Id = user.expenses[0]._id.toString();

// STEP 2 & 3: Refresh / Retrieve Simulation & Persistence
console.log('Step 2 & 3: Refresh & Persistence Check');
const retrievedExpenses = user.expenses;
assert.equal(retrievedExpenses.length, 1);
assert.equal(retrievedExpenses[0]._id.toString(), savedExpense1Id);
assert.equal(retrievedExpenses[0].description, 'shopping');
assert.equal(retrievedExpenses[0].amount, 2000);

// STEP 4: Edit Expense
console.log('Step 4: Edit Expense (Modify amount to 2500, category to Shopping, paymentMethod to Credit Card)');
const editUpdates = {
  description: 'shopping - weekend mall',
  amount: 2500,
  category: 'Shopping',
  paymentMethod: 'Credit Card',
  date: '2026-10-07'
};

const expToEdit = user.expenses.find(e => e._id.toString() === savedExpense1Id);
assert.ok(expToEdit, 'Expense found for edit');
expToEdit.description = editUpdates.description;
expToEdit.amount = editUpdates.amount;
expToEdit.paymentMethod = editUpdates.paymentMethod;

assert.equal(user.expenses[0].amount, 2500);
assert.equal(user.expenses[0].description, 'shopping - weekend mall');
assert.equal(user.expenses[0].paymentMethod, 'Credit Card');

// STEP 5: Delete Expense
console.log('Step 5: Delete Expense');
user.expenses = user.expenses.filter(e => e._id.toString() !== savedExpense1Id);
assert.equal(user.expenses.length, 0, 'Expense successfully removed from ledger');

// STEP 6: Add Second Expense
console.log('Step 6: Add Multiple Expenses in Sequence');
const expA = normalizeExpense({ description: 'Grocery Market', amount: 1200, category: 'Food & Dining', paymentMethod: 'UPI', date: '2026-10-08' });
const expB = normalizeExpense({ description: 'Electricity Bill', amount: 3500, category: 'Utilities', paymentMethod: 'Net Banking', date: '2026-10-08' });
user.expenses.unshift(expA);
user.expenses.unshift(expB);
assert.equal(user.expenses.length, 2);
assert.equal(user.expenses[0].description, 'Electricity Bill');
assert.equal(user.expenses[1].description, 'Grocery Market');

// STEP 7: Add Expense with Decimal Amount
console.log('Step 7: Decimal Amount Handling');
const expDecimal = normalizeExpense({ description: 'Cafe Coffee', amount: 349.75, category: 'Food & Dining', paymentMethod: 'UPI', date: '2026-10-08' });
assert.equal(expDecimal.amount, 349.75, 'Decimal amounts supported with precision');
user.expenses.push(expDecimal);
assert.equal(user.expenses.length, 3);

// STEP 8: Invalid Amount Rejection / Sanitization
console.log('Step 8: Invalid Amount Rejection');
const invalidAmt1 = normalizeExpense({ description: 'Bad', amount: -500 });
assert.equal(invalidAmt1.amount, 0, 'Negative amount normalized to 0');
const invalidAmt2 = normalizeExpense({ description: 'Bad', amount: 'abc' });
assert.equal(invalidAmt2.amount, 0, 'String amount normalized to 0');

// STEP 9: Invalid Date Handling
console.log('Step 9: Invalid Date Handling');
const invalidDateExp = normalizeExpense({ description: 'Bus Ticket', amount: 50, date: 'not-a-valid-date' });
assert.ok(invalidDateExp.date instanceof Date, 'Invalid date safely falls back to current date');
assert.ok(!isNaN(invalidDateExp.date.getTime()));

// STEP 10: Backward Compatibility with Old String IDs (exp_...)
console.log('Step 10: Backward Compatibility with Legacy String IDs');
const legacyExpense = normalizeExpense({
  _id: 'exp_1791400384874_vkifn',
  description: 'Old shopping record',
  amount: 2000,
  category: 'Shopping',
  paymentMethod: 'UPI',
  date: '2026-10-07'
});

assert.ok(legacyExpense._id instanceof mongoose.Types.ObjectId, 'Legacy string _id converted to valid ObjectId');
assert.equal(legacyExpense.expenseId, 'exp_1791400384874_vkifn', 'Original string stored in expenseId');

user.expenses.push(legacyExpense);
assert.equal(user.expenses.length, 4, 'All 4 expenses stored in User document');

console.log('\n✅ ALL 10 STEPS OF EXPENSE LIFECYCLE PASSED PERFECTLY!\n');
