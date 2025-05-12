const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 587,
  auth: {
    user: '46c09f80d28fc4',
    pass: '2b6569f4e3d28f',
  },
});

async function sendEmail(to, subject, text) {
  return transporter.sendMail({ from: '"Cyber Project" <no-reply@cyber.com>', to, subject, text });
}

module.exports = sendEmail;