const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const activationCode = require("../../../models/activationCode");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");


class loginController extends controller {
  showLogin(req, res) {
    let formData = req.flash("formData")[0];
    res.render("auth/login", {
      errors: req.flash("errors"),
      success: req.flash("success"),
      recaptcha: this.recaptcha.render(),
      title: "ورود",
      formData,
      layout: "auth/layout",
    });
  }
  validateResult(req, res, next) {
    const error = validationResult(req).array();
    const errors = [];
    error.forEach((err) => {
      errors.push(err.msg);
    });
    if (errors.length > 0) {
      req.flash("errors", errors);
      req.flash("formData", req.body);
      res.redirect("/login");
    } else {
      next();
    }
  }
  processLogin(req, res, next) {
    this.recaptcha.verify(req, (err, data) => {
      if (err) {
        req.flash("errors", "موارد امنیتی را رعایت کنید");
        res.redirect("/login");
      } else {
        this.login(req, res, next);
      }
    });
  }
  async login(req, res, next) {
    passport.authenticate("local.login", async (err, user) => {
      if (!user) return res.redirect("/login");

      if (!user.active) {
        let activeCode = await activationCode
          .find({ user: user.id })
          .gt("expire", new Date())
          .sort({ createdAt: -1 })
          .limit(1)
          .populate("user")
          .exec();
        if(activeCode.length){
          this.alert(req, {
            title: 'توجه کنید',
            message: 'لینک فعالسازی به ایمیل شما ارسال شده..برای ارسال مجدد لطفا پانزده دقیقه صبر کنید و از طریق فرم ورود دوباره اقدام نمایید',
            type: 'error',
            icon: 'error',
            button: 'بسیار خب'
          })
          this.back(req, res);
          return;
        }else{
          let code = uniqueString();
          let newActiveCode = new activationCode({
            user: user.id,
            code,
            expire: Date.now() + 1000 * 60 * 15,
          });
          await newActiveCode.save();
          //send Email
          let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "omidobeidzadeh@gmail.com", 
              pass: "13777731zo", 
            },
          }); 
          let options = {
            from: '"Licotab 👻" <omidobeidzadeh@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "فعالسازی اکانت ✔", // Subject line
            html: `
            <b>فعالسازی اکانت</b>
            <p>روی لینک زیر کلیک کنید</p>
            <a href="http://localhost:3000/user/activation/${newActiveCode.code}" >فعالسازی </a>`, // html body
          };
          transporter.sendMail(options, (err, info)=>{
            if(err) return console.log(err)
            console.log('message send:', info.messageId)
    
          });
          this.alert(req, {
            title: 'موفقیت',
            message: 'ایمیل حاوی لینک فعالسازی برای شما ارسال شد..این لینک تا پانزده دقیقه فعال است',
            type: 'success',
            icon: 'success',
            button: 'بسیار خب'
          })
          res.redirect("/login");
          return;
        }
      }

      req.login(user, function (err) {
        if (req.body.remember) {
          user.setRememberToken(res);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  }
}

module.exports = new loginController();
