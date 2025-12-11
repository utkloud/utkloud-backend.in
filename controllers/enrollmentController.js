import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Enrollment from '../models/Enrollment.js';

// Function to send WhatsApp message
const sendWhatsAppMessage = async (data) => {
  try {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || 
        !process.env.TWILIO_WHATSAPP_NUMBER || !process.env.ADMIN_WHATSAPP_NUMBER) {
      console.warn('Twilio credentials not configured. Skipping WhatsApp notification.');
      return { success: true, message: 'WhatsApp notification skipped (not configured)' };
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Clean the admin WhatsApp number (remove spaces)
    const cleanAdminNumber = process.env.ADMIN_WHATSAPP_NUMBER.replace(/\s+/g, '');
    
    // Format message based on form type
    let messageBody;
    if (data.type === 'enrollment') {
      messageBody = `🎓 *New Course Enrollment*\n\n` +
                    `*Name:* ${data.name}\n` +
                    `*Email:* ${data.email}\n` +
                    `*Phone:* ${data.phone}\n` +
                    `*Course:* ${data.course}\n` +
                    `*Experience:* ${data.experience || 'Not specified'}\n` +
                    `*Date:* ${new Date(data.createdAt).toLocaleString()}`;
    } else {
      messageBody = `📧 *New Contact Message*\n\n` +
                    `*Name:* ${data.name}\n` +
                    `*Email:* ${data.email}\n` +
                    `*Phone:* ${data.phone}\n` +
                    `*Course Interest:* ${data.course || 'Not specified'}\n` +
                    `*Message:* ${data.message || 'No message'}\n` +
                    `*Date:* ${new Date(data.createdAt).toLocaleString()}`;
    }
    
    const message = await client.messages.create({
      body: messageBody,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:' + cleanAdminNumber
    });
    
    console.log('WhatsApp message sent:', message.sid);
    return { success: true, message: 'WhatsApp notification sent', messageId: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

// Function to send email
const sendEmail = async (data) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: true, message: 'Email notification skipped (not configured)' };
    }

    // Initialize email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Format email based on form type
    let subject, html;
    if (data.type === 'enrollment') {
      subject = `New Course Enrollment: ${data.course}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">🎓 New Course Enrollment</h2>
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Course:</strong> ${data.course}</p>
            <p><strong>Experience Level:</strong> ${data.experience || 'Not specified'}</p>
            <p><strong>Submission Date:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
          </div>
        </div>
      `;
    } else {
      subject = 'New Contact Message';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">📧 New Contact Message</h2>
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Course Interest:</strong> ${data.course || 'Not specified'}</p>
            <p><strong>Message:</strong> ${data.message || 'No message provided'}</p>
            <p><strong>Submission Date:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
          </div>
        </div>
      `;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully', messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Controller functions
const handleEnrollment = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required fields'
      });
    }
    
    // Create new enrollment in database
    const enrollment = new Enrollment({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      course: req.body.course,
      experience: req.body.experience,
      message: req.body.message,
      type: req.body.type
    });
    
    // Save to database
    const savedEnrollment = await enrollment.save();
    
    // Send notifications
    const whatsappResult = await sendWhatsAppMessage(savedEnrollment.toObject());
    const emailResult = await sendEmail(savedEnrollment.toObject());
    
    // Log results
    console.log('Enrollment stored:', savedEnrollment._id);
    console.log('WhatsApp result:', whatsappResult);
    console.log('Email result:', emailResult);
    
    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully',
      data: savedEnrollment,
      notifications: {
        whatsapp: whatsappResult,
        email: emailResult
      }
    });
  } catch (error) {
    console.error('Error handling enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing enrollment',
      error: error.message
    });
  }
};

const getEnrollments = async (req, res) => {
  try {
    // Get all enrollments from database, sorted by creation date (newest first)
    const enrollments = await Enrollment.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

export {
  handleEnrollment,
  getEnrollments
};