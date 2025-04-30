const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.EMAIL_USER ,
    pass:process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (to, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_SUPPORT,
      to,
      subject: "Password Reset",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}" target="_blank">${resetLink}</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset email sent: " + info.response);
    return { success: true, message: "Reset email sent successfully" };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: "Email sending failed" };
  }
};

module.exports = sendResetEmail;
