const nodemailer = require('nodemailer');
require('dotenv').config();

// הגדרות עבור Gmail עם סיסמת אפליקציה
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.User_Mail,      // Your Gmail address
    pass: process.env.App_Pass                 // App password (no spaces)
  }
});

/**
 * Email sending function — always sending to you!
 * @param {string} _to - Unnecessary, ignored
 * @param {string} subject -Message subject
 * @param {string} text - Message body
 */
async function sendEmail(_to, subject, text) {
  const mailOptions = {
    from: 'daniellkarminsky@gmail.com',
    to: 'daniellkarminsky@gmail.com', // Always sent to you!
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = sendEmail;
