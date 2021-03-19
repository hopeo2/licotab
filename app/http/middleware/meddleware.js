const autoBind = require('auto-bind')


module.exports = class Middleware {
    constructor(){
        autoBind(this)
    }
    alert(req, data){
        let title = data.title || '',
            message = data.message || '',
            icon = data.icon || 'info',
            type = data.type || 'info',
            button = data.button || null,
            timer = data.timer || 2000;

        req.flash('sweetalert', {title, message, type, button, timer, icon});
    }
    back(req , res) {
        req.flash('formData', req.body)
        return res.redirect(req.header('Referer') || '/');
    }
}