
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, subject, message }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    text: message,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send email");
  }

  return data;
};

module.exports = sendEmail;
