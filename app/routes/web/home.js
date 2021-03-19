const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const HomeController = require("../../http/controllers/HomeController");
const allCourseController = require("../../http/controllers/AllCourse");
const loginController = require("../../http/controllers/auth/loginController");
const registerController = require("../../http/controllers/auth/registerController");
const forgotPassController = require("../../http/controllers/auth/forgotPassController");
const resetPassController = require("../../http/controllers/auth/resetPassController");
const userController = require("../../http/controllers/userController");
const router = express.Router();

// Middleware
const redirectIfAuthenticated = require("../../http/middleware/redirectIfAuthenticated");
const redirectIfNotAuthenticated = require("../../http/middleware/redirectIfNotAuthenticated");
const ErrorHandller = require("../../http/middleware/ErrorHandller");
const activeUser = require("../../http/middleware/activeUser");

//Validator
const registerValidator = require("../../http/validator/registerValidator");
const loginValidator = require("../../http/validator/loginValidator");
const passValidator = require("../../http/validator/passwordValidator");
const commentValidator = require("../../http/validator/commentValidator");


router.use((req, res, next) => {
  res.locals.layout = "home/layout";
  next();
});

//Home Routes--------------------------------------

router.get("/" , HomeController.index);
router.get("/about-me", HomeController.about);
router.get("/all-course", allCourseController.allcourse);
router.get("/all-course/:course", allCourseController.single);
router.post("/all-course/payment", redirectIfNotAuthenticated.handle, allCourseController.payment);
router.get("/all-course/payment/checker", redirectIfNotAuthenticated.handle, allCourseController.checker);
router.get("/download/:episode", allCourseController.download);
router.get("/user/panel", userController.index);
router.get("/user/panel/history", userController.history);
router.get("/user/panel/vip", userController.vip);
router.post("/user/panel/vip/payment", userController.vipPayment);
router.get("/user/panel/vip/payment/checker", userController.vipPaymentChecker);

router.post(
  "/comment",
  redirectIfNotAuthenticated.handle,
  commentValidator.handle(),
  allCourseController.validateResult,
  allCourseController.comment
);
router.get("/login", redirectIfAuthenticated.handle , loginController.showLogin);
router.post(
  "/login",
  loginValidator.handle(),
  loginController.validateResult,
  loginController.processLogin
);
//Active Account
router.get("/user/activation/:code", userController.activationCode);
router.get(
  "/register",
  redirectIfAuthenticated.handle,
  registerController.showRegister
);
router.post(
  "/register",
  [...registerValidator],
  registerController.validateResult,
  registerController.processRegister
);
router.get("/logout", function (req, res) {
  req.logout();
  res.clearCookie("remember_token");
  res.redirect("/");
});
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /auth/google/callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/register" }),
  (req, res) => {
    res.redirect("/");
  }
);
//Password----------------------------------------------

router.get("/password/reset", forgotPassController.showForgotPass);
router.post(
  "/password/email",
  [...passValidator],
  forgotPassController.validateResult,
  forgotPassController.sendPassResetLink
);
router.get("/password/reset/:token", resetPassController.showResetPass);
router.post(
  "/password/reset",
  [
    check("email").isEmail().withMessage("ایمیل معتبر نیست"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("پسورد نمیتواند کمتر از هشت کاراکتر باشد"),
  ],
  resetPassController.validateResult,
  resetPassController.resetPassProccess
);

//Sitemap
router.get("/sitemap.xml", HomeController.sitemap);
//Rss
router.get("/feed/courses", HomeController.courseFeed);

//Error
router.get("/notfound", (req, res)=>{
  res.render("errors/404", {layout: "errors/layout"})
})





module.exports = router;
