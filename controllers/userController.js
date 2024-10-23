const UserModel = require("../models/user.module");
const transporter = require('../config/nodemailerConfig');
const dotenv = require("dotenv");
dotenv.config();


const signIn = async (req, res) => {
    let { password, email } = req.body;
    console.log("Request has come for signin");

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.render('signin', {
                error: "no user found with this email --user contorller .js"
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            console.log('User is not verified. Checking OTP expiration...');

            if (user.otpExpires < Date.now()) {
                console.log('OTP expired, generating a new one...');
                // OTP expired, generate a new one and send it
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = verificationCode;
                // user.otpExpires = Date.now() + 3600000; // 1 hour
                user.otpExpires = Date.now() + 60 * 60 * 1000; // 2 minutes

                await user.save(); // Save the user with the new OTP

                const mailOptions = {
                    from: process.env.SMTP_MAIL,
                    to: email,
                    subject: 'Your New OTP Code',
                    text: `Your new OTP code is ${verificationCode}. It will expire in 1 hour.`,
                };

                console.log('Preparing to send email to:', email);
                // Send email and handle the result
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        return res.render('verify', {
                            error: 'Error sending verification email. Please try again.'
                        });
                    }
                    console.log('New OTP sent successfully:', info.response);
                    return res.render('verify', {
                        success: 'A new OTP has been sent to your email. Please check your inbox.'
                    });
                });
            } else {
                // Store the email in the session before redirecting
                req.session.email = email;
                console.log("Email stored in session:", req.session.email);
                return res.redirect('/user/verify');
            }
        } else {
            // Check if password matches
            const token = await UserModel.matchpasswordAndGenerateToken(email, password);
            console.log("Password matches -- user controler .js");

            res
                .cookie("token1", token)
                .redirect('/');
        }
    } catch (error) {
        console.error("Error during sign in:", error);
        return res.render('signin', {
            error: "An error occurred during sign in. Please try again."
        });
    }
};

module.exports = {


    signIn
};