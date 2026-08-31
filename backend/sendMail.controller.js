import nodemailer from "nodemailer";

export const SendMail = async (MailObj) => {
  const emailUser = process.env.APIEMAILADDRESS?.trim();
  const emailPass = process.env.APIEMAILPASS?.trim();

  if (!emailUser || !emailPass) {
    console.log("[SendMail] Email service is not configured (missing APIEMAILADDRESS or APIEMAILPASS in backend/.env).");
    return {
      success: false,
      delivered: false,
      message: "Email configuration is required. SMTP credentials (APIEMAILADDRESS / APIEMAILPASS) are not set in environment."
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `Arua Finance <${emailUser}>`,
      to: MailObj.email,
      subject: MailObj.subject,
      html: MailObj.html,
      bcc: MailObj.BccArr || [],
    });

    console.log(`[SendMail] Email successfully dispatched to ${MailObj.email}`);
    return {
      body: info,
      delivered: true,
      message: "Mail Sent Successfully",
      success: true,
    };
  } catch (error) {
    console.error("[SendMail] Error sending mail:", error.message || error);
    return {
      error: error.message || "Unknown error",
      delivered: false,
      success: false,
      message: `Failed to dispatch email: ${error.message || "SMTP error"}`
    };
  }
};
