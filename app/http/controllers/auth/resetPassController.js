const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const PasswordReset = require("../../../models/password-reset");
const User = require("../../../models/user");
const uniqueString = require("unique-string");

class resetPassController extends controller {
  showResetPass(req, res) {
    res.render("auth/resetPass", {
      errors: req.flash("errors"),
      success: req.flash("success"),
      recaptcha: this.recaptcha.render(),
      title: "بازیابی رمز عبور",
      token: req.params.token,
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
      res.redirect("/password/reset/" + req.body.token);
    } else if (success.length > 0) {
      req.flash("success", success);
      res.redirect("password/reset");
    } else {
      next();
    }
  }
  async resetPassProccess(req, res, next) {
    await this.recaptcha.verify(req, (err, data) => {
      if (err) {
        req.flash("errors", "موارد امنیتی را رعایت کنید");
        res.redirect(`/password/reset/${req.body.token}`);
      } else {
        this.resetPass(req, res);
      }
    });
  }
  async resetPass(req, res) {
    let field = await PasswordReset.findOne({
      $and: [{ email: req.body.email }, { token: req.body.token }],
    });
    if (!field) {
      req.flash("errors", "اطلاعات وارد شده صحیح نیست لطفا دقت فرمایید");
      return res.redirect(`/password/reset/${req.body.token}`);
    }
    if (field.use) {
      req.flash("errors", "از این لینک برای بازیابی اطلاعات استفاده شده");
      return res.redirect(`/password/reset/${req.body.token}`);
    }

    let user = await User.findOneAndUpdate(
      { email: field.email },
      { $set: { password: req.body.password } }
    );
    if (!user) {
      req.flash("errors", "عملیات با موفقیت انجام نشد");
      return res.redirect(`/password/reset/${req.body.token}`);
    }
    await field.updateOne({ use: true });
    req.flash("success", "عملیات با موفقیت انجام شد");
    return res.redirect("/login");
  }
}

module.exports = new resetPassController();
