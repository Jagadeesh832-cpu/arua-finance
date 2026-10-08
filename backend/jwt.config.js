/**
 * Arua Finance — Hardened JWT Configuration
 * Enforces production-grade secret requirement and prevents silent fallbacks.
 */

const INSECURE_DEFAULT = "arua_finance_jwt_secret_key_secure_2026";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (!secret || secret.trim().length < 32 || secret === INSECURE_DEFAULT) {
      throw new Error(
        "FATAL SECURITY MISCONFIGURATION: process.env.JWT_SECRET must be set to a secure string with at least 32 characters in production."
      );
    }
    return secret.trim();
  }

  // Non-production (development / test) environment only
  if (!secret || secret === INSECURE_DEFAULT) {
    return "dev_isolated_local_secret_not_valid_for_production_use_only";
  }

  return secret.trim();
}

export default { getJwtSecret };
