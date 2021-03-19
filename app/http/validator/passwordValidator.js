const { check, validationResult } = require('express-validator');

const validateInput = [
    check('email').not().isEmpty().withMessage('ایمیل نمیتواند خالی باشد'),
    check('email').isEmail().withMessage('ایمیل معتبر نیست'),
]

module.exports = validateInput;