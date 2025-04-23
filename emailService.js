const nodemailer = require("nodemailer");
const dotenv=require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT == '465',
    auth: {
        user:process.env.EMAIL_USER ,
        pass:process.env.EMAIL_PASS,
    },
    debug: true, // Enable SMTP debug logs
    logger: true,
});

const sendMail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = sendMail;
