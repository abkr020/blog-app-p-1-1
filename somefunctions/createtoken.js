const jwt = require('jsonwebtoken')
const secret = "uperman"
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