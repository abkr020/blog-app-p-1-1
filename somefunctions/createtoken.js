const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.SECRET_FOR_JWT_CREATE_TOKEN;
function createTokenForuser(user) {
    const paylode = {
        _id : user._id,
        email : user.email,
        fullname:user.fullname
    }
    const token = jwt.sign(paylode,secret)
    return token
    
}

function validateToken(token) {
    const paylode = jwt.verify(token,secret)
    return paylode

}


module.exports = {
    createTokenForuser,
    validateToken

}