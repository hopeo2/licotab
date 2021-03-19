const autoBind = require("auto-bind");
const { validationResult } = require('express-validator');

module.exports = class Controller {
    constructor(){
        autoBind(this)
    }
    faild(msg, res, statusCode = 500){
        res.status(statusCode).json({
            status: 'error',
            data: msg
        })
    }
    async validationData(req , res) {
        const result = validationResult(req);
        if (! result.isEmpty()) {
            const errors = result.array();
            const messages = [];
           
            errors.forEach(err => messages.push(err.msg));

            this.faild(messages , res , 403);

            return false;
        }

        return true;
    }
};
