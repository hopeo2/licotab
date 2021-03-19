const User = require('../../models/user')
const Middleware = require('./meddleware')

class redirectIfAuthenticated extends Middleware {
    handle(req, res, next){
        if(req.isAuthenticated()){
            return res.redirect('/')
        }
        next()
    }
}


module.exports = new redirectIfAuthenticated()