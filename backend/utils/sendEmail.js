
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, subject, message }) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Email service environment variables are missing");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    text: message,
  });

  if (error) {
    console.error("Resend error details:", {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });

    throw new Error(`Email provider failed: ${error.message}`);
  }

  console.log("Email accepted by provider:", data?.id);
  return data;
};

module.exports = sendEmail;
