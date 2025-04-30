require('dotenv').config();
const nodemailer = require('nodemailer');

// **Nodemailer Setup**
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail
    pass: process.env.EMAIL_PASS   // Your Gmail App Password
  }
});

/**
 * **Send Job Application Email**
 * @param {Object} application - Job application details
 * @param {string} application.designation - Job title
 * @param {string} application.name - Applicant's name
 * @param {string} application.email - Applicant's email
 * @param {string} application.phone - Applicant's phone
 * @param {string} application.experience - Applicant's experience
 * @param {string} application.resumePath - Resume file path
 */
const sendApplicationEmail = async ({ designation, name, email, phone, experience, resumePath }) => {
  try {
    const recruiterEmail = "shristijha0202@gmail.com"; // Change to recruiter's email

    const mailOptions = {
      from: process.env.EMAIL_SUPPORT,
      to: process.env.EMAIL_SUPPORT,
      subject: `New Job Application for ${designation}`,
      bcc: process.env.EMAIL_BCC ,
      html: `
        <h3>New Job Application Received</h3>
        <p><strong>Designation:</strong> ${designation}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Experience:</strong> ${experience} years</p>
        <p><strong>Resume:</strong> <a href="${process.env.API_BASE_URL}${resumePath}" target="_blank">Download Resume</a></p>
      `,
      attachments: resumePath ? [{ filename: resumePath.split('/').pop(), path: resumePath }] : []
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = { sendApplicationEmail };
