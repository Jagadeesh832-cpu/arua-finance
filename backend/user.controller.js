import { User } from './user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arua_finance_jwt_secret_key_secure_2026';

// Helper to generate JWT token
export function generateAuthToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Helper to sanitize user object (strip passwordHash and sensitive internals)
export function sanitizeUser(user) {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
}

// Helper to find a user by multiple identifiers
export async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim();
  const cleanDigits = clean.replace(/\D/g, "");
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : clean;

  return await User.findOne({
    $or: [
      { email: clean.toLowerCase() },
      { phoneNumber: clean },
      { phoneNumber: formattedPhone },
      ...(clean.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: clean }] : [])
    ]
  });
}

// Create or fetch existing user
export async function createUser({
  firstName,
  lastName,
  name,
  picture,
  email,
  phoneNumber,
  password,
  passwordHash,
  annualIncome,
  monthlyBudget,
  riskTolerance,
  goals,
  budgetBreakdown
}) {
  if (!name && !firstName && !phoneNumber && !email) {
    throw new Error("Name, phone number, or email is required");
  }

  const queryOr = [];
  if (phoneNumber) queryOr.push({ phoneNumber });
  if (email) queryOr.push({ email: email.toLowerCase().trim() });

  if (queryOr.length > 0) {
    const existingUser = await User.findOne({ $or: queryOr });
    if (existingUser) {
      if (phoneNumber && !existingUser.phoneNumber) existingUser.phoneNumber = phoneNumber;
      if (email && !existingUser.email) existingUser.email = email.toLowerCase().trim();
      if (firstName && !existingUser.firstName) existingUser.firstName = firstName.trim();
      if (lastName && !existingUser.lastName) existingUser.lastName = lastName.trim();
      if (picture && !existingUser.picture) existingUser.picture = picture;
      await existingUser.save();
      return existingUser;
    }
  }

  let finalHash = passwordHash;
  if (password && !finalHash) {
    finalHash = await bcrypt.hash(password, 10);
  }

  const fName = (firstName || "").trim();
  const lName = (lastName || "").trim();
  const derivedFullName = name || (fName || lName ? `${fName} ${lName}`.trim() : (phoneNumber ? `Investor ${phoneNumber.slice(-4)}` : "Arua Investor"));

  const newUser = new User({
    firstName: fName,
    lastName: lName,
    name: derivedFullName,
    picture: picture || "",
    email: email ? email.toLowerCase().trim() : (phoneNumber ? `${phoneNumber.replace(/[^0-9]/g, '')}@arua.finance` : `user_${Date.now()}@arua.finance`),
    phoneNumber: phoneNumber || "",
    passwordHash: finalHash || undefined,
    annualIncome: annualIncome !== undefined ? Number(annualIncome) : 500000,
    monthlyBudget: monthlyBudget !== undefined ? Number(monthlyBudget) : 30000,
    riskTolerance: riskTolerance || "Medium",
    goals: goals || [],
    budgetBreakdown: budgetBreakdown || { needs: 50, wants: 20, savings: 15, investments: 10, emergencyFund: 5 }
  });

  return await newUser.save();
}

// Fetch user data by email, phone, or _id
export async function fetchUserByEmail(identifier) {
  if (!identifier) throw new Error("Identifier (email or phone) is required");
  return await findUserByIdentifier(identifier);
}

// Set (update) user profile values
export async function updateUserDetails(identifier, updates) {
  if (!identifier) throw new Error("Identifier (email or phone) is required");

  const allowedFields = [
    'firstName', 'lastName', 'name', 'picture', 'email', 'phoneNumber', 'age',
    'annualIncome', 'monthlyExpense', 'savings', 'investmentHorizon',
    'riskTolerance', 'financialGoal', 'preferredAssets', 'expenses', 'monthlyBudget',
    'goals', 'budgetBreakdown'
  ];

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (filteredUpdates.firstName || filteredUpdates.lastName) {
    const f = filteredUpdates.firstName || "";
    const l = filteredUpdates.lastName || "";
    if (!filteredUpdates.name && (f || l)) {
      filteredUpdates.name = `${f} ${l}`.trim();
    }
  }

  const clean = String(identifier).trim();
  const cleanDigits = clean.replace(/\D/g, "");
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : clean;

  return await User.findOneAndUpdate(
    {
      $or: [
        { email: clean.toLowerCase() },
        { phoneNumber: clean },
        { phoneNumber: formattedPhone },
        ...(clean.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: clean }] : [])
      ]
    },
    { $set: filteredUpdates },
    { new: true, upsert: true }
  );
}

// Add a financial goal
export async function addGoal(identifier, goalData) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw new Error("User not found");

  const newGoal = {
    id: goalData.id || `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: goalData.name,
    category: goalData.category || "Custom Goal",
    targetAmount: Number(goalData.targetAmount) || 0,
    currentAmount: Number(goalData.currentAmount) || 0,
    targetDate: goalData.targetDate || "",
    monthlyContribution: Number(goalData.monthlyContribution) || 0,
    createdAt: new Date()
  };

  user.goals = user.goals || [];
  user.goals.push(newGoal);
  await user.save();
  return user;
}

// Update a financial goal
export async function updateGoal(identifier, goalId, updates) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw new Error("User not found");

  const goalIndex = (user.goals || []).findIndex(g => g.id === goalId || String(g._id) === goalId);
  if (goalIndex === -1) throw new Error("Goal not found");

  const goal = user.goals[goalIndex];
  if (updates.name !== undefined) goal.name = updates.name;
  if (updates.category !== undefined) goal.category = updates.category;
  if (updates.targetAmount !== undefined) goal.targetAmount = Number(updates.targetAmount);
  if (updates.currentAmount !== undefined) goal.currentAmount = Number(updates.currentAmount);
  if (updates.targetDate !== undefined) goal.targetDate = updates.targetDate;
  if (updates.monthlyContribution !== undefined) goal.monthlyContribution = Number(updates.monthlyContribution);

  user.markModified('goals');
  await user.save();
  return user;
}

// Delete a financial goal
export async function deleteGoal(identifier, goalId) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw new Error("User not found");

  user.goals = (user.goals || []).filter(g => g.id !== goalId && String(g._id) !== goalId);
  user.markModified('goals');
  await user.save();
  return user;
}
