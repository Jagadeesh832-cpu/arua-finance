import jwt from "jsonwebtoken";
import { User } from "./user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "arua_finance_jwt_secret_key_secure_2026";

/**
 * Middleware to authenticate requests via JWT Bearer token
 * Attaches decoded user to req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "No authorization token provided. Please log in."
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Malformed authorization token."
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Token is invalid or corrupted."
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
        message: "User associated with this token no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Your session has expired. Please sign in again."
      });
    }
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: "Invalid or expired authorization token."
    });
  }
}

/**
 * Optional authentication middleware: populates req.user if token is present, continues otherwise
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          req.user = await User.findById(decoded.id);
        }
      }
    }
  } catch (err) {
    // Ignore optional auth failures
  }
  next();
}
