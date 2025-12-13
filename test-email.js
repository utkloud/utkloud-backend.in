import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing Email configuration...');

// Check if credentials are present
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
  console.error('❌ Email credentials not found in environment variables');
  process.exit(1);
}

console.log('✅ Email credentials found');
console.log('Email user:', process.env.EMAIL_USER);
console.log('Admin email:', process.env.ADMIN_EMAIL);

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error verifying email configuration:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Email server is ready to send messages');
    
    // Send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Test Email from AI Academy Backend',
      text: 'This is a test email to verify email configuration.'
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Error sending test email:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
      } else {
        console.log('✅ Test email sent successfully');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});