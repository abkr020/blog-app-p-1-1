const express = require('express');
const router = express.Router();
const { sendVerificationEmail, verifyCode } = require('../controllers/verificationController');

// Render the email input form
router.get('/', (req, res) => {
    res.render('index');
});

// Handle email submission
router.post('/send-verification', sendVerificationEmail);

// Render the verification form
router.get('/verify', (req, res) => {
    res.render('verify', { email: req.session.email });
});

// Verify the code
router.post('/verify-code', verifyCode);

module.exports = router;
