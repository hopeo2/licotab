const User = require('../../models/user')
const Middleware = require('./meddleware')

class redirectIfNotAdmin extends Middleware {
    handle(req, res, next){
        if(req.isAuthenticated() && req.user.admin){
            return next()
        }
        return res.redirect('/notfound')
    }
}


module.exports = new redirectIfNotAdmin()