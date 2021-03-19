const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const PassReset = require("../../../models/password-reset");
const User = require("../../../models/user");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

class forgotPassController extends controller {
  showForgotPass(req, res) {
    let formData = req.flash("formData")[0];
    res.render("auth/forgotPass", {
      errors: req.flash("errors"),
      success: req.flash("success"),
      recaptcha: this.recaptcha.render(),
      title: "فراموشی رمز عبور",
      formData,
      layout: "auth/layout"
    });
  }
  validateResult(req, res, next) {
    const error = validationResult(req).array();
    const errors = [];
    const successs = validationResult(req).array();
    const success = [];
    error.forEach((err) => {
      errors.push(err.msg);
    });
    successs.forEach((err) => {
      success.push(err.msg);
    });
    if (errors.length > 0) {
      req.flash("errors", errors);
      res.redirect("/password/reset");
    } else if (success.length > 0) {
      req.flash("success", success);
      res.redirect("password/reset");
    } else {
      next();
    }
  }
  async sendPassResetLink(req, res, next) {
    await this.recaptcha.verify(req, (err, data) => {
      if (err) {
        req.flash("errors", "موارد امنیتی را رعایت کنید");
        res.redirect("/password/reset");
      } else {
        this.sendResetLink(req, res);
      }
    });
  }
  async sendResetLink(req, res, next) {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("errors", "چنین کاربری وجود ندارد");
      return res.redirect("/password/reset");
    } else {
      const newPassUser = new PassReset({
        email: req.body.email,
        token: uniqueString(),
      });
      let pReset = await newPassUser.save();
      //send Mail
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "omidobeidzadeh@gmail.com", 
          pass: "13777731zo", 
        },
      });  
      let options = {
        from: '"Licotab 👻" <omidobeidzadeh@gmail.com>', // sender address
        to: newPassUser.email, // list of receivers
        subject: "بازیابی رمز عبور ✔", // Subject line
        html: `
        <b>ریست کردن پسورد</b>
        <p>روی لینک زیر کلیک کنید</p>
        <a href="http://localhost:3000/password/reset/${newPassUser.token}" >ریست کردن</a>`, // html body
      };
      transporter.sendMail(options, (err, info)=>{
        if(err) return console.log(err)
        console.log('message send:', info.messageId)

      })
      this.alert(req, {
        title: 'موفقیت',
        message: 'ایمیل حاوی لیمک بازیابی برای شما ارسال شد',
        type: 'success',
        icon: 'success',
        button: 'success'
      })
      res.redirect("/");
    }
  }
}

module.exports = new forgotPassController();
