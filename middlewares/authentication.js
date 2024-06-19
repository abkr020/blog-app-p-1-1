const { validateToken } = require("../somefunctions/createtoken");

function checkForAuthenticationCookie(cookieName) {
    return (req,res,next)=>{
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue){
            return next();
        }
        try {
            const userpaylode = validateToken(tokenCookieValue)
            req.user = userpaylode;

        } catch (error) {
            
        }
        return next()
    }
}



module.exports={
    checkForAuthenticationCookie,
}