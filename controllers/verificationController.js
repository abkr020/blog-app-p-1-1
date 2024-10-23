const transporter = require('../config/nodemailerConfig');
const dotenv = require("dotenv");
const { updateUserWithBlueTick } = require('../services/userService');

dotenv.config();
const UserModel = require("../models/user.module");

const sendVerificationEmail = async (req, res) => {
    const { fullname, password, email } = req.body;

    try {
        // Check if user already exists
        const checkuser = await UserModel.findOne({ email });
        if (checkuser) {
            return res.status(400).send("User already exists. Please log in.");
        }

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store email and verification code in session
        req.session.email = email;
        req.session.verificationCode = verificationCode;

        // Create user but don't set isVerified yet
        const user = await UserModel.create({
            fullname,
            email,
            otp: verificationCode,
            otpExpires: Date.now() + 60 * 60 * 1000, // 2 minutes
            isVerified: false,
            password, // Hash the password before saving in a real-world application
            password2: password,

        });

        // Send verification email
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${verificationCode}. It will expire in 1 hour.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error sending email. Please try again later.');
            }
            res.redirect('/user/verify');
        });

    } catch (error) {
        console.error("Error in sendVerificationEmail:", error);
        return res.status(500).send('An error occurred. Please try again later.');
    }
};

const verifyCode = async (req, res) => {
    const email = req.session.email;
    console.log(email);
    console.log("email check");
    const { otp } = req.body;

    try {
        
        const user = await UserModel.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
            isVerified: false
        });

        if (user) {
            user.isVerified = true;
            await user.save();
            req.session.destroy(); // Clear session data after verification
            console.log("User verified successfully");
            try {
                const result = await updateUserWithBlueTick();
                // res.status(200).send({ message: 'Blue tick updated successfully', result });
            } catch (error) {
                res
                .status(500)
                .send({ error: error.message })
                // .redirect('/user/signin') //using this if errer is catch
                ;
            }
            res.redirect('/user/signin');
        } else {
            // No user found matching the criteria
            return res.render('verify', {
                error: "No account found with this email and OTP. Please check your details and try again."
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.render('verify', {
            error: "An error occurred while verifying your OTP. Please try again later."
        });
    }
};

// const verifyCode = async (req, res) => {
//     const email = req.session.email;
//     console.log(email);
//     console.log("email check");
//     const { otp } = req.body;
//     console.log(otp);

//     try {
//         const user = await UserModel.findOne({ email });

//         // Check if the user exists
//         if (!user) {
//             return res.render('verify', {
//                 error: "No account found with this email. Please check your details and try again."
//             });
//         }
//         console.log("email check");

//         console.log(`found the user with email ${user.email}`);
//         // Check if the OTP is valid and not expired
//         if (user.otp == otp && user.otpExpires > Date.now()) {
//             // OTP is valid, mark the user as verified
//             user.isVerified = true;
//             await user.save();
//             req.session.destroy(); // Clear session data after verification
//             console.log("User verified successfully");
//             return res.redirect('/user/signin');
//         } else {
//             // OTP is either invalid or expired
//             if (user.otpExpires <= Date.now()) {
//                 // OTP has expired, generate a new OTP
//                 // const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//                 // Update user with new OTP and expiration
//                 // user.otp = newVerificationCode;
//                 // user.otpExpires = Date.now() + 3600000; // 1 hour
//                 // await user.save();

//                 // Use sendVerificationEmail to send new OTP
//                 req.body = { fullname: user.fullname, password: user.password, email }; // Adjust as necessary
//                 // req.body.otp = newVerificationCode; // Set the new OTP

//                 return await sendVerificationEmail(req, res); // Call the existing function
//             } else {
//                 // Invalid OTP case
//                 return res.render('verify', {
//                     error: "Invalid OTP. Please check your details and try again."
//                 });
//             }
//         }
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         return res.render('verify', {
//             error: "An error occurred while verifying your OTP. Please try again later."
//         });
//     }
// };
module.exports = { sendVerificationEmail, verifyCode };
