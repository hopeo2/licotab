const autoBind = require('auto-bind')
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const sprintf = require('sprintf-js').sprintf;
const isMongoId = require('validator/lib/isMongoId');


module.exports = class controller {
    constructor(){
        autoBind(this)
        this.recaptchaConfig()
    }

    recaptchaConfig(){
        this.recaptcha = new Recaptcha(
            `${process.env.client_key_recaptcha}`,
            `${process.env.secret_key_recaptcha}`,
              {hl: 'fa'},
        );
    }
    back(req , res) {
        req.flash('formData', req.body)
        return res.redirect(req.header('Referer') || '/');
    }
    isMongoId(paramId){
        if(!isMongoId(paramId)){
            this.error('چنین دوره ای با این آیدی یافت نشد!', 404)
        }
    }
    error(message , status = 500) {
        let err = new Error(message);
        err.status = status;
        throw err;
    }
    getTime(episodes) {
        let second = 0;

        episodes.forEach(episode => {
            let time = episode.time.split(":");
            if(time.length === 2) {
                second += parseInt(time[0]) * 60;
                second += parseInt(time[1]);
            } else if(time.length === 3) {
                second += parseInt(time[0]) * 3600;
                second += parseInt(time[1]) * 60;
                second += parseInt(time[2]);
            }
        });

        let minutes = Math.floor(second / 60);
        
        let hours = Math.floor(minutes / 60);

        minutes -= hours * 60;

        second = Math.floor(( ( second / 60 ) % 1 ) * 60 );
    
        return sprintf('%02d:%02d:%02d' , hours , minutes , second);
    }
    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
    }
    alert(req, data){
        let title = data.title || '',
            message = data.message || '',
            icon = data.icon || 'info',
            type = data.type || 'info',
            button = data.button || null,
            timer = data.timer || 2000

        req.flash('sweetalert', {title, message, type, button, timer, icon});
    }
}
