import nodemailer from "nodemailer";

export const SendMail = async (MailObj) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APIEMAILADDRESS,
        pass: process.env.APIEMAILPASS,
      },
    });

    const info = await transporter.sendMail({
      from: `AI-Powered Financial Intelligence <${process.env.APIEMAILADDRESS}>`,
      to: MailObj.email,
      subject: MailObj.subject,
      html: MailObj.html,
      bcc: MailObj.BccArr || [],
    });

    console.log("Mail Sent Done");
    return {
      body: info,
      message: "Mail Send Successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error sending mail", error);
    return {
      error: error.message || "Unknown error",
      success: false,
    };
  }
};
