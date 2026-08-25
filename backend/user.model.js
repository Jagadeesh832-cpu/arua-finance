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
    age: {
      type: Number,
      min: 0,
      default: 25
    },
    expenses: {
      type: [
        {
          description: String,
          amount: Number,
          category: String,
          date: Date
        }
      ],
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

