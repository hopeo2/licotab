const Middleware = require('./meddleware');

class activeUser extends Middleware {
    handle(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.active) return next();
            this.alert(req, {
                title: 'دقت کنید',
                message: 'برای فعال کردن اکانت خود از طریق فرم ورود اقدام به ورود نمایید',
                icon: 'error',
                type: 'error',
                button: 'اوک',
            });
            req.logout();
            res.clearCookie("remember_token");
            return this.back(req, res)
        }else{
            next()
        }
    }
        
}


module.exports = new activeUser()