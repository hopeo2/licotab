const express = require("express");
const router = express.Router();

const courseController = require("../../../http/controllers/api/v1/courseController");
const authController = require("../../../http/controllers/api/v1/authController");

//validator
const loginValidator = require("../../../http/validator/loginValidator");

router.get("/courses", courseController.courses);
router.get("/courses/:course", courseController.singleCourse);
router.get("/courses/:course/comment", courseController.commentForSingleCourse);

router.post("/login", loginValidator.handle() , authController.login);

module.exports = router;