const User = require('../../models/user')
const Middleware = require('./meddleware')

class redirectIfNotAuthenticated extends Middleware {
    handle(req, res, next){
        if(!req.isAuthenticated()){
            return res.redirect('/login')
        }
        next()
    }
}


module.exports = new redirectIfNotAuthenticated()