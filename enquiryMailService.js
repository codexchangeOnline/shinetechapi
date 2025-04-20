// services/mailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();
// Configure transporter (Use Gmail or Mailtrap)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:process.env.EMAIL_USER ,
    pass:process.env.EMAIL_PASS,
  }
});

/**
 * Send enquiry email
 * @param {Object} enquiryData - The enquiry form data
 * @returns {Promise}
 */
const sendEnquiryEmail = async (enquiryData) => {
  const { name, email, phone,message, selectedService } = enquiryData;
  try {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'shristijha0202@gmail.com',
    subject: 'New Enquiry Received',
    html: `
      <h3>Enquiry Details</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service Type:</strong> ${selectedService}</p>
      <p><strong>Message:</strong> ${message}</p>
    `
  }
  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent:", info.response);
} catch (error) {
  console.error("❌ Error sending email:", error);
}

};

module.exports = { sendEnquiryEmail };
