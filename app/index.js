const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const  i18n  = require('i18n');
const expressLayouts = require('express-ejs-layouts'); 
const Helpers = require('./helpers');
const rememberLogin = require('../app/http/middleware/rememberLogin');
const activeUser = require('../app/http/middleware/activeUser');
const methodOverride = require('method-override');
const gate = require('./http/helpers/gate');

module.exports = class Application{
    constructor(){
        this.setupExpress()
        this.setMongoConnection()
        this.setConfig()
        this.setRoutes()
    }
    setupExpress(){
        const server = http.createServer(app) 
        server.listen(`${process.env.PORT}` , console.log(`server is running on ${process.env.PORT}`))
    }
    //MongoDb----------------------------------
    setMongoConnection() {
        mongoose.Promise = global.Promise;
        mongoose.connect(config.dataBase.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }).then(() => { console.log('connect to mongo')})
        .catch((err)=>{console.log(`connect to mongo faild \n with this error${err}`)})
    }
    //Config------------------------------------
    setConfig(){
        //Global
        app.use(function (req, res, next) {
            res.locals.user = req.user
            next()
        })
        require('./passport/passport-strategy')
        require('./passport/passport-jwt')

        
        app.use(express.static('public'))
        app.set('view engine', 'ejs')
        app.set('views' ,path.resolve('./resource/views'))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(session({...config.session}))
        app.use(cookieParser(`${process.env.session_key}`))
        app.use(methodOverride('_method'));
        app.use(require('connect-flash')());
        app.use(expressLayouts)
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(rememberLogin.handle)
        app.use(gate.middleware());
        i18n.configure({
            locales: ['en', 'fa'],
            directory: path.resolve('./resource/lang'),
            defaultLocale: 'fa',
            cookie: 'lang'
        })
        app.use(i18n.init);

        app.use((req, res, next) => {
            app.locals = new Helpers(req, res).getObj()
            next()
        })
    }
    setRoutes(){
        app.use(activeUser.handle)
        app.use(require('./routes/api'));
        app.use(require('./routes/web'));
    }
}