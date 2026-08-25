/**
 * 2Factor SMS OTP Service for Indian Mobile Numbers (+91)
 * Official 2Factor REST API (SMS Phone Verification)
 * Docs: https://2factor.in/
 */

export class TwoFactorService {
  static getApiKey() {
    const key = process.env.TWOFACTOR_API_KEY || process.env.TWO_FACTOR_API_KEY;
    return key ? key.trim() : null;
  }

  static getOtpLength() {
    return parseInt(process.env.OTP_LENGTH || '6', 10);
  }

  /**
   * Sends real SMS OTP to Indian 10-digit mobile number via 2Factor.in SMS API
   * Endpoint: https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE}/AUTOGEN
   * @param {string} rawPhone - 10-digit Indian number or +91 format
   * @returns {Promise<{ success: boolean, sessionId?: string, otpLength: number, message: string }>}
   */
  static async sendOtp(rawPhone) {
    const apiKey = this.getApiKey();
    const otpLength = this.getOtpLength();

    if (!apiKey) {
      return {
        success: false,
        message: "2Factor API Key is missing in backend/.env. Please configure TWOFACTOR_API_KEY."
      };
    }

    const cleanPhone = (rawPhone || "").replace(/\D/g, "");
    const phone10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

    if (phone10.length !== 10) {
      return {
        success: false,
        message: "Invalid Indian mobile number. Please enter a valid 10-digit number."
      };
    }

    try {
      const templateParam = process.env.TWOFACTOR_OTP_TEMPLATE
        ? `/${encodeURIComponent(process.env.TWOFACTOR_OTP_TEMPLATE.trim())}`
        : "";

      // Official 2Factor SMS Phone Verification endpoint
      const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(phone10)}/AUTOGEN${templateParam}`;

      console.log(`[2Factor SMS Service] Dispatching SMS OTP to +91 ${phone10.slice(0, 2)}******${phone10.slice(-2)} (Expected OTP Length: ${otpLength})`);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      const data = await response.json();
      console.log(`[2Factor SMS Service] Response Status: ${data.Status}, Details: ${typeof data.Details === 'string' ? data.Details.slice(0, 30) : data.Details}`);

      if (data.Status === "Success") {
        return {
          success: true,
          sessionId: data.Details,
          otpLength: otpLength,
          message: `Real SMS OTP sent successfully to +91 ${phone10}`
        };
      } else {
        console.error("[2Factor SMS Service] Failed response:", data);
        return {
          success: false,
          message: data.Details || "Failed to send SMS OTP. Please check your 2Factor account balance or mobile number."
        };
      }
    } catch (error) {
      console.error("[2Factor SMS Service] Network error:", error.message);
      return {
        success: false,
        message: "Network error connecting to 2Factor SMS gateway. Please try again."
      };
    }
  }

  /**
   * Verifies the SMS OTP using the sessionId provided during sendOtp
   * Endpoint: https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{SESSION_ID}/{OTP}
   * @param {string} sessionId - Session ID returned by 2Factor
   * @param {string} otpCode - User-entered OTP
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async verifyOtp(sessionId, otpCode) {
    const apiKey = this.getApiKey();
    const otpLength = this.getOtpLength();

    if (!apiKey) {
      return {
        success: false,
        message: "2Factor API Key is missing in backend/.env."
      };
    }

    const cleanOtp = (otpCode || "").trim();
    if (!cleanOtp || cleanOtp.length !== otpLength) {
      return {
        success: false,
        message: `Please enter the complete ${otpLength}-digit OTP code.`
      };
    }

    if (!sessionId) {
      return {
        success: false,
        message: "OTP session has expired. Please request a new OTP."
      };
    }

    try {
      const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(cleanOtp)}`;
      console.log(`[2Factor SMS Service] Verifying ${cleanOtp.length}-digit OTP for session ${sessionId.slice(0, 8)}...`);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json();
      console.log(`[2Factor SMS Service] Verification Result: Status=${data.Status}, Details=${data.Details}`);

      if (data.Status === "Success" && data.Details && data.Details.toLowerCase().includes("matched")) {
        return {
          success: true,
          message: "OTP verified successfully."
        };
      } else {
        return {
          success: false,
          message: data.Details === "OTP Mismatch"
            ? `Incorrect OTP code. Please enter the valid ${otpLength}-digit code received on your phone.`
            : (data.Details || "OTP verification failed.")
        };
      }
    } catch (error) {
      console.error("[2Factor SMS Service] Verification network error:", error.message);
      return {
        success: false,
        message: "Network error during OTP verification. Please try again."
      };
    }
  }
}
