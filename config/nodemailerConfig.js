// nodemailerConfig.js
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

// Create the transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_MAIL,     // Your email
        pass: process.env.SMTP_PASSWORD, // Your email password or app password
    },
});

// Export the transporter for use in other files
module.exports = transporter;
