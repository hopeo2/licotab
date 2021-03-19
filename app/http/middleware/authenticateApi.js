const middleware = require("./meddleware");
const passport = require("passport")


class authenticateApi extends middleware {
    handle(req, res, next){
        passport.authenticate('jwt', {session: false}, (err, user, info)=>{
            if(err || !user){
                res.status(401).json({
                    status: 'error',
                    data : info.message || 'اجازه دسترسی ندارید',
                })
            }
            req.user = user;
            next()
        })(req, res, next);
    }
}; 

module.exports = new authenticateApi();