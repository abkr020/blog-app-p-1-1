const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const { createTokenForuser } = require('../somefunctions/createtoken');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,

    },
    password: {
        type: String,
        required: true,
    },
    // password2: {
    //     type: String,
    //     required: true,
    // },
    profileImageURL: {
        type: String,
        default: '/public/images/0d64989794b1a4c9d89bff571d3d5842.jpg',
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },

}, { timestamps: true })

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(5, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.salt = salt;
            user.password = hash;
            next();
        });
    });
});

userSchema.static("matchpasswordAndGenerateToken", async function (email, password) {
    // console.log(this)
    const user = await this.findOne({ email })
    if (!user) throw new Error("no user founfd - user.module.js")
    const salt = user.salt;
    const hashpassword = user.password;
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Password does not match - user.module.js");
    }


    const token = createTokenForuser(user)

    return token;


})
const UserModel = mongoose.model('user', userSchema)

module.exports = UserModel;