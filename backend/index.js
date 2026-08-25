import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ConnectMongoDB, isDbConnected } from './MongoDBConnection.js';
import { User } from './user.model.js';
import {
  createUser,
  fetchUserByEmail,
  updateUserDetails,
  generateAuthToken,
  sanitizeUser,
  addGoal,
  updateGoal,
  deleteGoal
} from './user.controller.js';
import { SendMail } from './sendMail.controller.js';
import { TwoFactorService } from './twofactor.service.js';
import { AIService } from './ai.service.js';

dotenv.config();
const app = express();
app.use(express.json());

// Production-grade CORS middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CLIENT_ORIGIN,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : []),
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production';

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Request-Private-Network, Access-Control-Request-Headers');
  
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Initialize MongoDB connection on startup
ConnectMongoDB().catch((err) => {
  // Error already logged by MongoDBConnection event listener
});

// Middleware to ensure DB connection before executing database queries
const requireDatabase = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await ConnectMongoDB();
    } catch (err) {
      // Connect failed
    }
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: "Database is not connected. Please make sure your current IP is whitelisted in MongoDB Atlas Network Access.",
      message: "Database connection unavailable. MongoDB Atlas is not connected (check Network Access IP whitelist in Atlas)."
    });
  }
  next();
};

// Root & Health check routes
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Arua Finance Backend API is running' });
});

app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({ 
    status: 'ok', 
    database: dbState,
    dbReadyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString() 
  });
});

// Apply DB connection guard to all /api/auth, /api/user, and /api/ai routes
app.use('/api/auth', requireDatabase);
app.use('/api/user', requireDatabase);
app.use('/api/ai', requireDatabase);


// In-memory rate limiting map: key -> { count, expiresAt }
const rateLimitMap = new Map();

function checkRateLimit(key, maxRequests = 5, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    const waitSeconds = Math.ceil((entry.expiresAt - now) / 1000);
    return { allowed: false, message: `Too many requests. Please wait ${waitSeconds} seconds.` };
  }
  entry.count += 1;
  return { allowed: true };
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const p10 = digits.length > 10 ? digits.slice(-10) : digits;
  if (p10.length === 10) {
    return `+91 ${p10.slice(0, 2)}******${p10.slice(-2)}`;
  }
  return phone;
}

// ==========================================
// 1. SIGN UP: Step 1 - Validate & Send SMS OTP
// ==========================================
app.post('/api/auth/signup-otp', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: "First name is required." });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: "Last name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Valid email address is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email format." });
    }

    const rawPhone = String(phoneNumber || "").replace(/\D/g, "");
    const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    if (phone10.length !== 10) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit Indian mobile number." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const formattedPhone = `+91${phone10}`;

    // Check if email already exists in MongoDB
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please Sign In."
      });
    }

    // Check if phone number already exists in MongoDB
    const existingPhone = await User.findOne({
      $or: [{ phoneNumber: formattedPhone }, { phoneNumber: phone10 }]
    });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "An account with this mobile number already exists. Please Sign In."
      });
    }

    // Rate-limit check on phone number
    const rateCheck = checkRateLimit(phone10, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: rateCheck.message });
    }

    // DO NOT CREATE THE USER YET - Send 2Factor SMS OTP
    const otpResult = await TwoFactorService.sendOtp(phone10);
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    res.status(200).json({
      success: true,
      sessionId: otpResult.sessionId,
      otpLength: otpResult.otpLength || 6,
      maskedPhone: maskPhone(phone10),
      phoneNumber: formattedPhone,
      message: `Real SMS verification code sent to +91 ${phone10}`
    });
  } catch (err) {
    console.error("signup-otp error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to initiate Sign Up verification." });
  }
});

// ==========================================
// 2. SIGN UP: Step 2 - Verify OTP & Create User
// ==========================================
app.post('/api/auth/signup-verify', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, sessionId, otp } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "Missing required registration details." });
    }
    if (!sessionId || !otp) {
      return res.status(400).json({ success: false, message: "OTP session ID and verification code are required." });
    }

    const rawPhone = String(phoneNumber || "").replace(/\D/g, "");
    const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const cleanEmail = email.toLowerCase().trim();
    const formattedPhone = `+91${phone10}`;

    // Verify OTP via 2Factor SMS Service
    const verifyResult = await TwoFactorService.verifyOtp(sessionId, otp);
    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    // Check duplicate once more before creating
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { phoneNumber: formattedPhone }, { phoneNumber: phone10 }]
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with these details was already registered. Please Sign In."
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Create user in MongoDB Atlas
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      email: cleanEmail,
      phoneNumber: formattedPhone,
      passwordHash: passwordHash,
      annualIncome: 500000,
      monthlyBudget: 30000,
      riskTolerance: "Medium",
      expenses: []
    });

    await newUser.save();

    // Generate JWT token
    const token = generateAuthToken(newUser);
    const sanitized = sanitizeUser(newUser);

    res.status(201).json({
      success: true,
      token,
      user: sanitized,
      phoneNumber: formattedPhone,
      message: "Account created and verified successfully!"
    });
  } catch (err) {
    console.error("signup-verify error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create account." });
  }
});

// ==========================================
// 3. SIGN IN: Email or Phone + Password
// ==========================================
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your registered Email or Mobile Number." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Please enter your password." });
    }

    const cleanInput = identifier.trim();
    const rawDigits = cleanInput.replace(/\D/g, "");
    const phone10 = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
    const formattedPhone = phone10.length === 10 ? `+91${phone10}` : cleanInput;

    // Rate-limit failed sign in attempts per identifier
    const rateCheck = checkRateLimit(`login_${cleanInput.toLowerCase()}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: rateCheck.message });
    }

    // Find user by email OR phone number (including +passwordHash)
    const user = await User.findOne({
      $or: [
        { email: cleanInput.toLowerCase() },
        { phoneNumber: cleanInput },
        { phoneNumber: formattedPhone },
        ...(phone10.length === 10 ? [{ phoneNumber: phone10 }] : [])
      ]
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found matching this email or mobile number. Please check your details or Sign Up."
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "This account was created via quick phone verification. Please sign in using Phone OTP or set up a password in your Profile."
      });
    }

    // Compare bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify your password and try again."
      });
    }

    // Generate JWT token
    const token = generateAuthToken(user);
    const sanitized = sanitizeUser(user);

    res.status(200).json({
      success: true,
      token,
      user: sanitized,
      phoneNumber: user.phoneNumber,
      message: "Signed in successfully!"
    });
  } catch (err) {
    console.error("signin error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to sign in." });
  }
});

// ==========================================
// 4. Quick Phone OTP Login (Preserved)
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    if (!rawPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const phone10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

    const rateCheck = checkRateLimit(phone10, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: rateCheck.message });
    }

    const result = await TwoFactorService.sendOtp(phone10);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send OTP" });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, phone, sessionId, otp } = req.body;
    const rawPhone = phoneNumber || phone;
    if (!rawPhone || !sessionId || !otp) {
      return res.status(400).json({ success: false, message: "Phone number, session ID, and OTP are required." });
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const phone10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
    const formattedPhone = `+91${phone10}`;

    const verifyResult = await TwoFactorService.verifyOtp(sessionId, otp);
    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    // OTP matched: Fetch or create MongoDB user profile
    let user = await fetchUserByEmail(formattedPhone);
    if (!user) {
      user = await createUser({
        phoneNumber: formattedPhone,
        name: `Investor ${phone10.slice(-4)}`,
        annualIncome: 500000,
        monthlyBudget: 30000,
        riskTolerance: "Medium"
      });
    }

    const token = generateAuthToken(user);
    const sanitized = sanitizeUser(user);

    res.status(200).json({
      success: true,
      token,
      user: sanitized,
      phoneNumber: formattedPhone,
      message: "Phone verified successfully"
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to verify OTP" });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const rawPhone = req.body.phoneNumber || req.body.phone;
    if (!rawPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const phone10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

    const rateCheck = checkRateLimit(phone10, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: rateCheck.message });
    }

    const result = await TwoFactorService.sendOtp(phone10);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("resend-otp error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to resend OTP" });
  }
});

// ==========================================
// 5. Existing Profile & User CRUD Endpoints
// ==========================================
app.post('/api/user/create', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user', async (req, res) => {
  try {
    const identifier = req.query.phone || req.query.phoneNumber || req.query.email || req.query.identifier;
    if (!identifier) return res.status(400).json({ error: "Phone number or email is required" });
    const user = await fetchUserByEmail(identifier);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/user/update', async (req, res) => {
  try {
    const { email, phone, phoneNumber, identifier, ...updates } = req.body;
    const userIdentifier = phone || phoneNumber || email || identifier;
    if (!userIdentifier) return res.status(400).json({ error: "User identifier is required" });
    const user = await updateUserDetails(userIdentifier, {
      ...(email ? { email } : {}),
      ...(phone || phoneNumber ? { phoneNumber: phone || phoneNumber } : {}),
      ...updates
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. Financial Goal Management Endpoints
// ==========================================
app.post('/api/user/goals', async (req, res) => {
  try {
    const { identifier, phone, email, ...goalData } = req.body;
    const userIdentifier = identifier || phone || email;
    if (!userIdentifier) return res.status(400).json({ error: "User identifier is required" });
    if (!goalData.name || !goalData.targetAmount) {
      return res.status(400).json({ error: "Goal name and target amount are required" });
    }

    const updatedUser = await addGoal(userIdentifier, goalData);
    res.status(201).json({ success: true, user: sanitizeUser(updatedUser), goals: updatedUser.goals });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/user/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { identifier, phone, email, ...updates } = req.body;
    const userIdentifier = identifier || phone || email;
    if (!userIdentifier) return res.status(400).json({ error: "User identifier is required" });

    const updatedUser = await updateGoal(userIdentifier, goalId, updates);
    res.json({ success: true, user: sanitizeUser(updatedUser), goals: updatedUser.goals });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/user/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const userIdentifier = req.query.identifier || req.query.phone || req.query.email || req.body.identifier;
    if (!userIdentifier) return res.status(400).json({ error: "User identifier is required" });

    const updatedUser = await deleteGoal(userIdentifier, goalId);
    res.json({ success: true, user: sanitizeUser(updatedUser), goals: updatedUser.goals });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. AI Wealth Intelligence Endpoints
// ==========================================
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, chatHistory, identifier, phone, email, userData } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let user = userData;
    const userIdentifier = identifier || phone || email;
    if (!user && userIdentifier) {
      user = await fetchUserByEmail(userIdentifier);
    }

    const botResponse = await AIService.coachChat(user || {}, message, chatHistory || []);
    res.json({ success: true, response: botResponse });
  } catch (err) {
    console.error("AI Coach endpoint error:", err);
    res.status(500).json({ error: err.message || "Failed to process AI chat" });
  }
});

app.get('/api/ai/health-score', async (req, res) => {
  try {
    const identifier = req.query.identifier || req.query.phone || req.query.email;
    let user = null;
    if (identifier) {
      user = await fetchUserByEmail(identifier);
    }
    const health = AIService.calculateHealthScore(user);
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/report', async (req, res) => {
  try {
    const identifier = req.query.identifier || req.query.phone || req.query.email;
    if (!identifier) return res.status(400).json({ error: "User identifier is required" });
    const user = await fetchUserByEmail(identifier);
    if (!user) return res.status(404).json({ error: "User not found" });

    const report = await AIService.generateMonthlyReport(user);
    res.json({ success: true, report });
  } catch (err) {
    console.error("AI Report endpoint error:", err);
    res.status(500).json({ error: err.message || "Failed to generate monthly report" });
  }
});

app.post('/api/sendmail', async (req, res) => {
  try {
    const mailResponse = await SendMail(req.body);
    if (mailResponse.success) {
      res.status(200).json(mailResponse);
    } else {
      res.status(500).json(mailResponse);
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to send mail" });
  }
});

const port = process.env.PORT || 4000;

// Start local server when not in a Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
export { app };
