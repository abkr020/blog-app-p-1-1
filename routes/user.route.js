const { Router } = require('express')
const router = Router();
const dotenv = require("dotenv");
dotenv.config();
// const cookieParser = require('cookie-parser');
// router.use(cookieParser())
const UserModel = require("../models/user.module")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTokenForuser } = require('../somefunctions/createtoken');
const BlogModel = require('../models/blog.module');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');

const {sendVerificationEmail , verifyCode}=require('../controllers/verificationController')
const {signIn} = require('../controllers/userController');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

router.get('/rc', async (req, res) => {
    // const allblogs = await BlogModel.find({ createdBy: req.user })

    console.log("req.cookie")
    console.log(req.cookies)
    res.send("server can read the cookie having user_id email name _id : user._id email : user.email fullname:user.fullname")
    // res.render('profile', { user: req.user, blogs: allblogs })
})
router.get('/profile', async (req, res) => {
    const allblogs = await BlogModel.find({ createdBy: req.user })

    res.render('profile', { user: req.user, blogs: allblogs })
})
router.get('/signin', (req, res) => {
    res.render('signin')
})
router.get('/signup', (req, res) => {
    res.render('signup')
})
router.get('/logout', (req, res) => {
    res.clearCookie("token1")
    // res.cookie("token", "")
    res.redirect('/')
})
router.post('/signup',sendVerificationEmail);

router.get('/verify', (req, res) => {
    // app.get('/user/verify', (req, res) => {
    res.render('verify');
});
router.post('/verifyCode', verifyCode)

router.post('/setting/otp-send', async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(400).send('User not found.');
    }
    console.log("sending otp for password change -- user.roeuter.js")
    console.log(req.user.email)

    const otp = crypto.randomInt(100000, 999999);

    await UserModel.findOneAndUpdate(
        { _id: req.user._id },
        { otp: otp }
    );

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: req.user.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 1 hour.`
    };
    console.log("mail option created -- user.roeuter.js")


    try {
        const info = await transporter.sendMail(mailOptions);

        console.log("Mail sent done : ");
        // res.redirect('/user/verify');

    } catch (error) {
        console.log(error);
        res.send('Error sending email');
    }
    console.log(" mail send now varifiy otp -- user.module.js")
    res.redirect('/user/setting/vfpc');
});
router.get('/setting/vfpc', (req, res) => {
    // app.get('/user/verify', (req, res) => {
    res.render('vfpc');
});
router.post('/setting/vfpc', async (req, res) => {
    const { otp } = req.body;
    // const { email, otp } = req.body;
    const email = req.user.email;
    console.log(req.user.email);
    console.log(otp);

    const user = await UserModel.findOne({
        email,
        otp,
        // otpExpires: { $gt: Date.now() },
        // isVerified: false
    });
    console.log("user foundreq.user.email");
    console.log(user);

    if (user) {
        // user.isVerified = true;
        // await user.save();
        // res.send('Email successfully verified!');
        // res.redirect('/user/profile');
        res.redirect('/user/setting/pas/change');
        // res.render('change.pasword');


    } else {
        res.send('Invalid or expired OTP for password change');
    }
});


router.post('/signin', signIn)

router.get('/setting/pas/change', (req, res) => {

    res.render('changepas');

  

})
router.get('/setting', (req, res) => {


    res.render('setting', {
        user: req.user,
    })


})
router.post('/setting/change-password', async (req, res) => {
    const { newPassword } = req.body;
   
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(400).send('User not found.');
    }



    console.log("setting the new passord after otp varification -- user.module.js")
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await UserModel.findOneAndUpdate(
        { _id: req.user._id },
        { password: hashedPassword },
        { new: true }
    );
    await UserModel.findOneAndUpdate(
        { _id: req.user._id },
        { password2: newPassword },
        { new: true }
    );
    //   const token = jwt.sign({ id: user.id, username: user.username }, uperman, { expiresIn: '1h' });
    const token = createTokenForuser(req.user)
    res.cookie("token", token)


    //   res.header('Authorization', token).send('Password successfully changed. Use new token for future requests.');

    res.redirect('/')

    console.log("now varifiy otp end -- user.module.js")

});
router.post('/change-password', async (req, res) => {
    const { newPassword } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(400).send('User not found.');
    }
    console.log("sending otp for password change -- user.roeuter.js")
    console.log(req.user.email)

    const otp = crypto.randomInt(100000, 999999);

    await UserModel.findOneAndUpdate(
        { _id: req.user._id },
        { otp: otp }
    );

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: req.user.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 1 hour.`
    };
    console.log("mail option created -- user.roeuter.js")


    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Mail sent:", info.response);
        // res.redirect('/user/verify');

    } catch (error) {
        console.log(error);
        res.send('Error sending email');
    }
    console.log("now varifiy otp -- user.module.js")
    res.redirect('/user/vfpc');


    if (0) {

        console.log("setting the new passord after otp varification -- user.module.js")
        const salt = await bcrypt.genSalt(5);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await UserModel.findOneAndUpdate(
            { _id: req.user._id },
            { password: hashedPassword },
            { new: true }
        );
        await UserModel.findOneAndUpdate(
            { _id: req.user._id },
            { password2: newPassword },
            { new: true }
        );
        //   const token = jwt.sign({ id: user.id, username: user.username }, uperman, { expiresIn: '1h' });
        const token = createTokenForuser(req.user)
        res.cookie("token", token)


        //   res.header('Authorization', token).send('Password successfully changed. Use new token for future requests.');

        res.redirect('/')
    }
    console.log("now varifiy otp end -- user.module.js")

});

module.exports = router;