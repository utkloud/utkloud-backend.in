import express from 'express';

const router = express.Router();

// Simple login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if admin credentials are set in environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // If no admin credentials are configured, deny access
  if (!adminUsername || !adminPassword) {
    return res.status(500).json({
      success: false,
      message: 'Admin credentials not configured'
    });
  }
  
  // Validate credentials
  if (username === adminUsername && password === adminPassword) {
    // Create a simple session
    req.session = req.session || {};
    req.session.isAdminAuthenticated = true;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Check authentication status
router.get('/check', (req, res) => {
  // Check if admin credentials are set in environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // If no admin credentials are configured, deny access
  if (!adminUsername || !adminPassword) {
    return res.status(500).json({
      success: false,
      message: 'Admin credentials not configured'
    });
  }
  
  // Check if session exists and is valid
  if (req.session && req.session.isAdminAuthenticated) {
    return res.status(200).json({
      success: true,
      message: 'Authenticated'
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Clear session
  if (req.session) {
    req.session.isAdminAuthenticated = false;
  }
  
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;