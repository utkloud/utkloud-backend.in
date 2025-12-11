// Simple in-memory session store (for demonstration purposes only)
// In production, you should use a proper session store like Redis or database
const sessions = new Map();

// Generate a simple session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const sessionMiddleware = (req, res, next) => {
  // Parse cookies
  const cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      cookies[parts[0]] = parts[1];
    });
  }
  
  // Check for existing session
  const sessionId = cookies.sessionId;
  if (sessionId && sessions.has(sessionId)) {
    req.session = sessions.get(sessionId);
  } else {
    // Create new session
    req.session = {};
  }
  
  // Store the original res.end function
  const originalEnd = res.end;
  
  // Override res.end to save session
  res.end = function(...args) {
    // Only set headers if they haven't been sent yet
    if (!res.headersSent) {
      // Save session if it has data and hasn't been saved yet
      if (Object.keys(req.session).length > 0 && !req.session.saved) {
        const sid = sessionId || generateSessionId();
        sessions.set(sid, req.session);
        req.session.saved = true; // Mark as saved to prevent duplicate saves
        
        // Set cookie
        res.setHeader('Set-Cookie', `sessionId=${sid}; Path=/; HttpOnly`);
      }
    }
    return originalEnd.apply(this, args);
  };
  
  next();
};

export default sessionMiddleware;