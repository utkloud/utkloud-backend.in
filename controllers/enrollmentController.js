import sgMail from "@sendgrid/mail";
import Enrollment from "../models/Enrollment.js";

// Function to send email
const sendEmail = async (data) => {
  try {
    // Check if email credentials are configured
    if (!process.env.ADMIN_EMAIL || !process.env.SENDGRID_API_KEY) {
      console.warn(
        "Email credentials not configured. Skipping email notification."
      );
      console.log("Environment variables check:", {
        adminEmail: process.env.ADMIN_EMAIL,
        sendGridApiKey: !!process.env.SENDGRID_API_KEY,
        sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL
      });
      return {
        success: true,
        message: "Email notification skipped (not configured)",
      };
    }

    // Log email configuration for debugging
    console.log("Email configuration check:", {
      adminEmail: process.env.ADMIN_EMAIL,
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      usingSendGrid: !!process.env.SENDGRID_API_KEY
    });

    // Use SendGrid REST API
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
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

    const msg = {
      to: process.env.ADMIN_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@academy.com",
      subject: subject,
      html: html,
    };

    console.log("Attempting to send email via SendGrid REST API:");
    console.log("- From:", msg.from);
    console.log("- To:", msg.to);
    console.log("- Subject:", msg.subject);

    // Send email using SendGrid REST API
    try {
      const response = await sgMail.send(msg);
      console.log("Email sent successfully via SendGrid REST API");
      console.log("SendGrid Response:", {
        statusCode: response[0].statusCode,
        headers: response[0].headers
      });
      return {
        success: true,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Error sending email via SendGrid:", error);
      if (error.response) {
        console.error("SendGrid error response:", error.response.body);
        // Log more detailed error information
        console.error("SendGrid error details:", {
          code: error.code,
          message: error.message,
          statusCode: error.response.statusCode,
          body: error.response.body
        });
      }
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error("Error sending email:", error);
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