import nodemailer from "nodemailer";
import Enrollment from "../models/Enrollment.js";

// Function to send email
const sendEmail = async (data) => {
  try {
    // Check if email credentials are configured
    if (!process.env.ADMIN_EMAIL) {
      console.warn(
        "Email credentials not configured. Skipping email notification."
      );
      return {
        success: true,
        message: "Email notification skipped (no admin email configured)",
      };
    }

    // Log email configuration for debugging (without exposing secrets)
    console.log("Email configuration check:", {
      adminEmail: process.env.ADMIN_EMAIL,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
      usingSendGrid: !!process.env.SENDGRID_API_KEY
    });

    let transporter;
    
    // Check if we should use SendGrid
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid with alternative connection options
      transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 465,
        secure: true, // Use SSL on port 465
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });
      
      console.log("Using SendGrid transport with SSL on port 465");
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use Gmail
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });
      
      console.log("Using Gmail transport");
    } else {
      console.warn("No valid email configuration found");
      return {
        success: true,
        message: "Email notification skipped (no valid configuration)",
      };
    }

    // Format email based on form type
    let subject, html;
    if (data.type === "enrollment") {
      subject = `New Course Enrollment: ${data.course}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">🎓 New Course Enrollment</h2>
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Course:</strong> ${data.course}</p>
            <p><strong>Experience Level:</strong> ${
              data.experience || "Not specified"
            }</p>
            <p><strong>Submission Date:</strong> ${new Date(
              data.createdAt
            ).toLocaleString()}</p>
          </div>
        </div>
      `;
    } else {
      subject = "New Contact Message";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">📧 New Contact Message</h2>
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Course Interest:</strong> ${
              data.course || "Not specified"
            }</p>
            <p><strong>Message:</strong> ${
              data.message || "No message provided"
            }</p>
            <p><strong>Submission Date:</strong> ${new Date(
              data.createdAt
            ).toLocaleString()}</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || "noreply@academy.com",
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: html,
    };

    console.log("Attempting to send email:");
    console.log("- From:", mailOptions.from);
    console.log("- To:", mailOptions.to);
    console.log("- Subject:", mailOptions.subject);

    // Add retry mechanism with exponential backoff
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return {
          success: true,
          message: "Email sent successfully",
          messageId: info.messageId,
        };
      } catch (error) {
        lastError = error;
        console.log(`Email attempt ${i + 1} failed:`, error.message);
        console.log("Error details:", {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode
        });
        
        if (i < 2) {
          // Wait with exponential backoff (2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i + 1) * 1000));
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Email error details:", {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });
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
        message: "Name, email, and phone are required fields",
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
      type: req.body.type,
    });

    // Save to database
    const savedEnrollment = await enrollment.save();

    // Send email notification only
    const emailResult = await sendEmail(savedEnrollment.toObject());

    // Log results
    console.log("Enrollment stored:", savedEnrollment._id);
    console.log("Email result:", emailResult);

    res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      data: savedEnrollment,
      notifications: {
        email: emailResult,
      },
    });
  } catch (error) {
    console.error("Error handling enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Error processing enrollment",
      error: error.message,
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
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollments",
      error: error.message,
    });
  }
};

export { handleEnrollment, getEnrollments };