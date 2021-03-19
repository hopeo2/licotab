const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const AdminController = require("../../http/controllers/admin/AdminController");
const courseController = require("../../http/controllers/admin/courseController");
const episodeController = require("../../http/controllers/admin/episodeController");
const userController = require("../../http/controllers/admin/userController");
const commentController = require("../../http/controllers/admin/commentController");
const categoryController = require("../../http/controllers/admin/categoryController");
const permissionController = require("../../http/controllers/admin/permissionController");
const roleController = require("../../http/controllers/admin/roleController");
const redirectIfNotAdmin = require('../../http/middleware/redirectIfNotAdmin')

const courseValidator = require("../../http/validator/courseValidator");
const episodeValidator = require("../../http/validator/episodeValidator");
const roleValidator = require('../../http/validator/roleValidator');
const usercreateValidator = require("../../http/validator/usercreateValidator");
const permissionValidator = require("../../http/validator/permissionValidator");
const categoryValidator = require("../../http/validator/categoryValidator");
const upload = require("../../http/helpers/uploadImages");
const gate = require("../../http/helpers/gate");

//Middleware
const convertImgtoFile = require("../../http/middleware/convertImgtoFile");

router.use((req, res, next) => {
  res.locals.layout = "admin/master";
  next();
});


//Admin Routes---------------------------------
router.get("/panel-admin" , AdminController.index);

// Course Routes
router.get("/admin/courses", courseController.index);
router.get("/admin/courses/create", courseController.create);
router.post(
  "/admin/courses/create",
  upload.single("images"),
  convertImgtoFile.handle,
  courseValidator.handle(),
  courseController.validateResult,
  courseController.store
);
router.get("/admin/courses/:id/edit", courseController.edit);
router.put(
  "/admin/courses/:id",
  upload.single("images"),
  convertImgtoFile.handle,
  courseValidator.handle(),
  courseController.validateResult,
  courseController.update
);
router.delete("/admin/courses/:id", courseController.destroy);

//User Controller
router.get("/admin/users", userController.index);
router.delete("/admin/users/:id", userController.destroy);
router.get("/admin/users/:id/toggleadmin", userController.toggleadmin);
router.get("/admin/users/create", userController.create);
router.post(
  "/admin/users/create",
  [...usercreateValidator],
  userController.validateResult,
  userController.store
);
router.get('/admin/users/:id/addrole' , userController.addrole);
router.put('/admin/users/:id/addrole' , userController.storeRoleForUser);

// Permission Routes
router.get("/admin/users/permissions", permissionController.index);
router.get("/admin/users/permissions/create", permissionController.create);
router.post(
  "/admin/users/permissions/create",
  permissionValidator.handle(),
  permissionController.validateResult,
  permissionController.store
);
router.get("/admin/users/permissions/:id/edit", permissionController.edit);
router.put(
  "/admin/users/permissions/:id",
  permissionValidator.handle(),
  permissionController.validateResult,
  permissionController.update
);
router.delete("/admin/users/permissions/:id", permissionController.destroy);


// Role Routes
router.get("/admin/users/roles", roleController.index);
router.get("/admin/users/roles/create", roleController.create);
router.post(
  "/admin/users/roles/create",
  roleValidator.handle(),
  roleController.validateResult,
  roleController.store
);
router.get("/admin/users/roles/:id/edit", roleController.edit);
router.put(
  "/admin/users/roles/:id",
  roleValidator.handle(),
  roleController.validateResult,
  roleController.update
);
router.delete("/admin/users/roles/:id", roleController.destroy);

// Episode Routes
router.get("/admin/episodes", episodeController.index);
router.get("/admin/episodes/create", episodeController.create);
router.post(
  "/admin/episodes/create",
  episodeValidator.handle(),
  episodeController.validateResult,
  episodeController.store
);
router.get("/admin/episodes/:id/edit", episodeController.edit);
router.put(
  "/admin/episodes/:id",
  episodeValidator.handle(),
  episodeController.validateResult,
  episodeController.update
);
router.delete("/admin/episodes/:id", episodeController.destroy);

// Category Routes
router.get("/admin/categories", categoryController.index);
router.get("/admin/categories/create", categoryController.create);
router.post(
  "/admin/categories/create",
  categoryValidator.handle(),
  categoryController.validateResult,
  categoryController.store
);
router.get("/admin/categories/:id/edit", categoryController.edit);
router.put(
  "/admin/categories/:id",
  categoryValidator.handle(),
  categoryController.validateResult,
  categoryController.update
);
router.delete("/admin/categories/:id", categoryController.destroy);

//Comment
router.get("/admin/comments", commentController.index);
router.get("/admin/comments/approved", commentController.aproved);
router.delete("/admin/comments/:id", commentController.destroy);
router.put("/admin/comments/:id/approved", commentController.update);

//Upload Image CkEditor
router.post(
  "/admin/upload-image",
  upload.single("upload"),
  AdminController.uploadImage
);




module.exports = router;
