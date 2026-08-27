import mongoose, { Schema } from "mongoose";

const goalSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: "Custom Goal",
    enum: ["Emergency Fund", "Buy a Car", "Buy a House", "Education", "Travel", "Retirement", "Custom Goal"]
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: String,
    default: ""
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const expenseSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    default: "Other",
    trim: true
  },
  paymentMethod: {
    type: String,
    default: "UPI",
    enum: ["UPI", "Cash", "Credit Card", "Debit Card", "Net Banking", "Other"]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    picture: {
      type: String,
      default: ""
    },
    phoneNumber: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    lastBudgetAlertSent: {
      type: Date
    },
    notificationPreferences: {
      inAppAlerts: { type: Boolean, default: true },
      pushAlerts: { type: Boolean, default: false },
      smsAlerts: { type: Boolean, default: false },
      emailAlerts: { type: Boolean, default: true },
      budgetThresholdAlerts: { type: Boolean, default: true },
      budgetExceededAlerts: { type: Boolean, default: true },
      categoryBudgetAlerts: { type: Boolean, default: true },
      unusualSpendingAlerts: { type: Boolean, default: true },
      goalMilestoneAlerts: { type: Boolean, default: true },
      monthlyReportAlerts: { type: Boolean, default: true },
      aiRecommendationAlerts: { type: Boolean, default: true },
      budgetThresholds: { type: [Number], default: [50, 75, 90, 100] }
    },
    pushSubscriptions: {
      type: [Schema.Types.Mixed],
      default: []
    },
    triggeredAlerts: {
      type: Schema.Types.Mixed,
      default: {}
    },
    age: {
      type: Number,
      min: 0,
      default: 25
    },
    expenses: {
      type: [expenseSchema],
      default: []
    },
    goals: {
      type: [goalSchema],
      default: []
    },
    budgetBreakdown: {
      needs: { type: Number, default: 50 },
      wants: { type: Number, default: 20 },
      savings: { type: Number, default: 15 },
      investments: { type: Number, default: 10 },
      emergencyFund: { type: Number, default: 5 }
    },
    annualIncome: {
      type: Number,
      min: 0,
      default: 500000
    },
    monthlyBudget: {
      type: Number,
      min: 0,
      default: 30000
    },
    monthlyExpense: {
      type: Number,
      min: 0,
      default: 20000
    },
    savings: {
      type: Number,
      min: 0,
      default: 50000
    },
    investmentHorizon: {
      type: Number, // in years
      min: 0,
      default: 3
    },
    riskTolerance: {
      type: String,
      default: "Medium",
      enum: ["Low", "Medium", "High"]
    },
    financialGoal: {
      type: String,
      default: "Wealth Creation & Tax Optimization"
    },
    preferredAssets: {
      type: String,
      default: "Equity Mutual Funds, SIP, PPF"
    }
  },
  { timestamps: true, bufferCommands: false }
);

export const User = mongoose.models.users || mongoose.model("users", userSchema);

