const authenticateAdmin = (req, res, next) => {
  // Check if admin credentials are set in environment variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no admin credentials are configured, deny access
  if (!adminUsername || !adminPassword) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials not configured",
    });
  }

  // Check if session exists and is valid
  if (req.session && req.session.isAdminAuthenticated) {
    return next();
  }

  // If no valid session, check for basic auth
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Parse basic auth header
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Validate credentials
  if (username === adminUsername && password === adminPassword) {
    // Set session
    req.session = req.session || {};
    req.session.isAdminAuthenticated = true;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
};

export default authenticateAdmin;
