const autoBind = require('auto-bind')


module.exports = class Middleware {
    constructor(req, res){
        autoBind(this)
    }
}