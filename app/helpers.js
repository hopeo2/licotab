const autoBind = require('auto-bind');
const moment = require('moment-jalali');
moment.loadPersian({persianDigits: true})

module.exports = class Helpers {
    constructor(req, res){
        autoBind(this)
        this.req = req;
        this.res = res;
        this.formData = req.flash('formData')[0];
    }

    getObj(){
        return {
            auth: this.auth(),
            old: this.old,
            time: this.time,
            req: this.req,
        }
    }
    auth(){
        return {
            user: this.req.user,
            check: this.req.isAuthenticated()
        }
    }
    old(field, defaultValue = ''){
        return this.formData && this.formData.hasOwnProperty(field) ? this.formData[field] : defaultValue;
    }  
    time(date){
        return moment(date);
    }
}

