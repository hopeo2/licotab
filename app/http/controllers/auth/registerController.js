const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const passport = require("passport");

class registerController extends controller {
  showRegister(req, res) {
    let formData = req.flash("formData")[0];
    res.render("auth/register", {
      errors: req.flash("errors"),
      recaptcha: this.recaptcha.render(),
      title: "عضویت",
      formData,
      layout: "auth/layout"
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
      res.redirect(req.originalUrl);
    } else {
      next();
    }
  }
  processRegister(req, res, next) {
    this.recaptcha.verify(req, (err, data) => {
      if (err) {
        req.flash("errors", "موارد امنیتی را رعایت کنید");
        res.redirect(req.originalUrl);
      } else {
        this.register(req, res, next);
      }
    });
  }
  register(req, res, next) {
    passport.authenticate("local.register", {
      successRedirect: '/login',
      failureRedirect: "/register",
      failureFlash: true,
    })(req, res, next);
  }
}

module.exports = new registerController();
