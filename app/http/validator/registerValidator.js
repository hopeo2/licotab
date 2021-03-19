const { check, validationResult } = require('express-validator');

const validateInput = [
    check('email').not().isEmpty().withMessage('ایمیل نمیتواند خالی باشد'),
    check('email').isEmail().withMessage('ایمیل معتبر نیست'),
    check('password').isLength({min: 8}).withMessage('پسورد نمیتواند کمتر از هشت کاراکتر باشد'),
    check('name').isLength({min: 5}).withMessage('نام نمیتواند کمتر از پنج کاراکتر باشد'),
]

module.exports = validateInput;
        
  