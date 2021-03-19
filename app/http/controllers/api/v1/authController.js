const Controller = require("../controller");
const Course = require("../../../../models/course");
const Comment = require("../../../../models/comment");
const passport = require("passport");
const jwt = require("jsonwebtoken");

class authController extends Controller {
    
    async login(req, res){ 
        if(! await this.validationData(req, res)) return;

        passport.authenticate('local.login', {session: false}, (err, user)=>{
            if(err) return this.faild(err.message, res, 500);
            if(!user) return this.faild('چنین کاربری با این مشخصات وجود ندارد', res, 404);
            

            req.login(user, {session: false}, (err)=>{
                if(err) return this.faild(err.message, res, 500); 
                //create token
                let token = jwt.sign({id: user.id}, process.env.jwt, {
                    expiresIn: 60 * 60 * 24
                });

                res.json({
                    status: 'success',
                    data: {
                        token,
                    }
                })
            })
        })(req, res);
    }

}

module.exports = new authController();