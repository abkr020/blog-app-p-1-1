const { Router } = require('express')
const router = Router();
const UserModel = require("../models/user.module")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTokenForuser } = require('../somefunctions/createtoken');
const BlogModel = require('../models/blog.module');



router.get('/profile',async (req, res) => {
    const allblogs = await BlogModel.find({createdBy:req.user})

    res.render('profile', { user: req.user, blogs:allblogs})
})
router.get('/signin', (req, res) => {
    res.render('signin')
})
router.get('/signup', (req, res) => {
    res.render('signup')
})
router.get('/logout', (req, res) => {
    res.clearCookie("token")
    // res.cookie("token", "")
    res.redirect('/')
})
router.post('/signup', async (req, res) => {
    let { fullname, password, email } = req.body;
    let checkuser = await UserModel.findOne({ email });
    if (checkuser) return res.status(500).send("user already exist");

    let user = await UserModel.create({
        fullname,
        email,
        password,
        password2: password,
    })
    res.redirect('/')


})
router.post('/signin', async (req, res) => {
    let { password, email } = req.body;

    try {
        const token = await UserModel.matchpasswordAndGenerateToken(email, password);

        res
            .cookie("token", token)
            .redirect('/')

    } catch (error) {
        return res.render('signin', {
            error: "encorrect email or password",
        })
    }

})
router.get('/setting', (req, res) => {


    res.render('setting', {
        user: req.user,
    })


})
router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.status(400).send('New passwords do not match.');
    }
    // console.log(req.user);
    const user = await UserModel.findById(req.user._id);
    if (!user) {
        return res.status(400).send('User not found.');
    }
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
        return res.status(400).send('Current password is incorrect.');
    }
    // Hash the new password
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
});

module.exports = router;