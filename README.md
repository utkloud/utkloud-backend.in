# AI Academy Backend

This is the backend service for handling form submissions from the AI Academy website. It processes enrollment and contact forms, then sends notifications via WhatsApp and email while storing the data in MongoDB for the admin dashboard.

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
   MONGODB_URI=mongodb+srv://academy-website:11223344@cluster0.jctj5xk.mongodb.net/?appName=Cluster0

   # Admin Credentials (for dashboard access)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=securepassword

   # Email configuration (for Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ADMIN_EMAIL=admin@yourcompany.com

   # Twilio configuration (for WhatsApp)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   ADMIN_WHATSAPP_NUMBER=+1234567890
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

### WhatsApp (Twilio)
To enable WhatsApp notifications:
1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Register a WhatsApp Business number
4. Update the environment variables with your credentials

## Development

The backend uses:
- Express.js for the web server
- MongoDB for data persistence
- Mongoose as the ODM
- Nodemailer for email notifications
- Twilio SDK for WhatsApp messaging