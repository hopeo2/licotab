const User = require('../../models/user')
const Middleware = require('./meddleware')

class convertImgtoFile extends Middleware {
    handle(req, res, next){
        if(!req.file){
            req.body.images = undefined;
        }else{
            req.body.images = req.file.originalname;
        }
        next()
    }
}


module.exports = new convertImgtoFile()