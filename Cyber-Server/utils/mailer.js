const nodemailer = require('nodemailer');

// הגדרות עבור Gmail עם סיסמת אפליקציה
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'daniellkarminsky@gmail.com',      // כתובת ה-Gmail שלך
    pass: 'lqufskphpssuigib'                 // סיסמת האפליקציה (ללא רווחים)
  }
});

/**
 * פונקציה לשליחת אימייל — תמיד שולחת אליך!
 * @param {string} _to - מיותר, מתעלמים ממנו
 * @param {string} subject - נושא ההודעה
 * @param {string} text - גוף ההודעה
 */
async function sendEmail(_to, subject, text) {
  const mailOptions = {
    from: 'daniellkarminsky@gmail.com',
    to: 'daniellkarminsky@gmail.com', // תמיד נשלח אליך!
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
