const path = require('path')
const validator = require('./validator')
const { check, validationResult } = require('express-validator');
const Course = require('../../models/course')

class courseValidator extends validator {
    handle(){
        return [
            check('title').isLength({min: 5}).withMessage('عنوان نمیتواند کمتر از ۵ حرف باشد'),
            check('title').custom(async (value , { req }) => {
                if(req.query._method === 'put') {
                    let course = await Course.findById(req.params.id);
                    if(course.title === value) return;
                }
                let course = await Course.findOne({ title : this.slug(value) });
                if(course) {
                    throw new Error('چنین دوره ای با این عنوان قبلا در سایت قرار داد شده است')
                }
            }),
            check('images').custom(async (value , { req }) => {
                if(req.query._method === 'put' && value === undefined) return;

                if(! value)
                    throw new Error('وارد کردن تصویر الزامی است');

                let fileExt = ['.png' , '.jpg' , '.jpeg' , '.svg'];
                if(! fileExt.includes(path.extname(value)))
                    throw new Error('پسوند فایل وارد شده از پسوندهای تصاویر نیست')
            }),
            check('body').isLength({min: 20}).withMessage('متن مقاله نمیتواند کمتر از ۲۰ حرف باشد'),
            check('price').not().isEmpty().withMessage('قیمت نمیتواند خالی باشد'),
            check('tags').not().isEmpty().withMessage('تگ نمیتواند خالی باشد')
        ]
    }
    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
    }
}

module.exports = new courseValidator();