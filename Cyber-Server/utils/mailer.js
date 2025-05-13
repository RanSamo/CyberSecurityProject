const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_MAIL,      // Your Gmail address
    pass: process.env.APP_PASS                 // App password (no spaces)
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
    from: process.env.USER_MAIL,
    to: process.env.USER_MAIL, // Always sent to you!
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
