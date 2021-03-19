const validator = require('./validator')
const { check, validationResult } = require('express-validator');

class commentValidator extends validator {
    handle(){
        return [
            check('comment').isLength({min: 5}).withMessage('متن مقاله نمیتواند کمتر از ۵ حرف باشد'),
        ]
    }
}

module.exports = new commentValidator();