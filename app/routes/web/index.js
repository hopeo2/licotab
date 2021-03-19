const express = require('express')
const router = express.Router()
const homeRouter = require('./home')
const adminRouter = require('./admin')
const  i18n  = require('i18n');

//Middleware/*/*/*/-/*/*/*/*/*/*/*/*/*/*/*/*///*/*/*/*//**/*/*/*/*/*//* */
const redirectIfNotAdmin = require('../../http/middleware/redirectIfNotAdmin')
const ErrorHandller = require('../../http/middleware/ErrorHandller');

router.use((req, res, next)=>{
    try {
        let lang = req.signedCookies.lang;
        if(i18n.getLocales().includes(lang)){
            req.setLocale(lang)
        }else{
            req.setLocale(i18n.getLocale())
        }
        next()
    } catch (err) {
        next(err)
    }
})

//Language
router.get('/lang/:lang', (req, res)=>{
    let lang = req.params.lang;
    if(i18n.getLocales().includes(lang)){
        res.cookie('lang', lang, {maxAge: 1000 * 60 * 60 * 24 * 90, signed: true});
    }
    res.redirect(req.header('Referer') || '/');
})

//Home Router*-*--*-*-*-**-*-*-*-**-*--*-*-*---*-*-*-*-***-***-*-*-*-
router.use('/', homeRouter)

//Admin Router-*-*-*-*--*--*--*--*--*-*-*-*---*--*-*--*-*--**-*-
router.use('/', redirectIfNotAdmin.handle, adminRouter)

//Handel Error *-**-*-*-*-*-*-*--*-*-*-*-*-*--*-*--*--*-*-*-*--*--*-*-*-

router.all('*' , ErrorHandller.error404);
router.use(ErrorHandller.handller);


module.exports = router;