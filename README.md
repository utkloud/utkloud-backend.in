# AI Academy Backend

This is the backend service for handling form submissions from the AI Academy website. It processes enrollment and contact forms, then sends notifications via email while storing the data in MongoDB for the admin dashboard.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   The `.env` file already contains the MongoDB connection string. Update other values as needed:
   ```
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=

   # Admin Credentials (for dashboard access)
   ADMIN_USERNAME=
   ADMIN_PASSWORD=


   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

- `POST /api/enrollment/submit` - Submit a new enrollment or contact form
- `GET /api/enrollment/all` - Get all enrollments (for admin dashboard) - **Requires Authentication**
- `POST /api/auth/login` - Admin login endpoint
- `POST /api/auth/logout` - Admin logout endpoint
- `GET /health` - Health check endpoint

## Admin Dashboard Access

The admin dashboard is now protected with authentication:

1. Navigate to `/login.html` to access the login page
2. Enter the admin credentials configured in your environment variables
3. After successful login, you'll be redirected to the admin dashboard
4. Use the "Logout" button to securely log out

## Integration Services

### Database (MongoDB)
The backend uses MongoDB Atlas for data persistence. The connection is already configured with the provided URI.

### Email (Nodemailer)
Currently configured for Gmail. You'll need to:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## Development

The backend uses:
- Express.js for the web server
- MongoDB for data persistence
- Mongoose as the ODM
- Nodemailer for email notifications

## Deployment

For deployment on Render:
1. Make sure all environment variables are properly configured
2. The service will automatically bind to the port specified by Render
3. Use the production environment variables in `.env.production`
4. Verify your Gmail App Password is correctly configured
