const validator = require('./validator');
const { check, validationResult } = require('express-validator');

class loginvalidator extends validator {
    handle(){
        return [
            check('email').not().isEmpty().withMessage('ایمیل نمیتواند خالی باشد'),
            check('email').isEmail().withMessage('ایمیل معتبر نیست'),
            check('password').not().isEmpty().withMessage('پسورد نمیتواند خالی باشد'),
            check('password').isLength({min: 8}).withMessage('پسورد نمیتواند کمتر از هشت کاراکتر باشد'),
        ]
    }
}

module.exports = new loginvalidator();