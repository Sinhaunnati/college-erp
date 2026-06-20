const nodemailer = require('nodemailer');

// For testing, use Ethereal (fake email service)
// Or use Gmail with App Password

const createTransporter = async () => {
  // For development - use Ethereal (fake emails)
  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // For production - use Gmail or SendGrid
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: '"College ERP" <noreply@college-erp.com>',
      to,
      subject,
      html,
    });
    console.log('📧 Email sent:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (err) {
    console.error('❌ Email error:', err);
    return null;
  }
};

module.exports = { sendEmail };