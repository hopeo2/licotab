const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const Course = require("../../../models/course");
const Category = require("../../../models/category");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

class courseController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: -1 }, limit: 2 }
      );
      if(!req.userCan('show-course')){
        this.error('شما دسترسی ندارید', 403)
      }
      res.render("admin/courses/index", { title: "دوره ها", courses });
    } catch (err) {
      next(err)
    }
  }

  async create(req, res) {
    let categories = await Category.find({});
    res.render("admin/courses/create", {
      errors: req.flash("errors"),
      title: "ایجاد دوره",
      categories
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
      if (req.file) fs.unlinkSync(req.file.path);
      this.back(req, res);
    } else {
      next();
    }
  }
  // validateResultForEdit(req, res, next){
  //     const error = validationResult(req).array()
  //     const errors = []
  //     error.forEach(err => {errors.push(err.msg)})
  //     if(errors.length > 0){
  //         req.flash('errors', errors)
  //         this.back(req, res)
  //     } else {
  //         next()
  //     }
  // }
  async store(req, res, next) {
    try {
      this.imageResize(req.file);
      const images = this.imageResize(req.file);
      const { body, price, tags, title, type } = req.body;
      const newCourse = new Course({
        user: req.user._id,
        body,
        price,
        tags,
        title,
        type,
        images,
        thumb: images[480],
        slug: this.slug(title),
      });
      await newCourse.save();
      return res.redirect("/admin/courses");
    } catch (err) {
        err.status = 500;
        next(err);
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id)
      let course = await Course.findById(req.params.id);
      if (!course) {
        if( ! course ){
          this.error('چنین دوره ای وجود ندارد' , 403);
        }
      }
      req.courseUserId = course.user;
      
      if(!req.userCan('edit-course')){
        this.error('شما دسترسی ندارید', 403)
      }

      let categories = await Category.find({});
      return res.render("admin/courses/edit", {
        errors: req.flash("errors"),
        course,
        title: "ویرایش دوره",
        categories
      });
    } catch (err) {
        next(err);
    }
  }
  async update(req, res, next) {
    try {
      let objForUpdate = {};
      //check thumb
      objForUpdate.thumb = req.body.imagesThumb;
      //check image
      if (req.file) {
        objForUpdate.images = this.imageResize(req.file);
        objForUpdate.thumb = objForUpdate.images[480];
      }
      delete req.body.images;
      objForUpdate.slug = this.slug(req.body.title);
      //update course
      await Course.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body, ...objForUpdate },
      });
      //redirect back
      return res.redirect("/admin/courses");
    } catch (err) {
        res.status = 500;
        next(err);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)
      let course = await Course.findById(req.params.id).populate('episodes').exec();
      if (!course) {
        throw new Error("چنین دوره ای یافت نشد");
      }
      // delete episodes
      course.episodes.forEach(episode => episode.remove());
      // delete Images
      Object.values(course.images).forEach((image) =>
        fs.unlinkSync(`./public${image}`)
      );
  
      // delete courses
      course.remove();
  
      return res.redirect("/admin/courses");
    } catch (err) {
        res.status = 500;
        next(err);
    }
  }

  imageResize(image) {
    const imageInfo = path.parse(image.path);
    let addresImages = {};
    addresImages["original"] = this.getUrlImage(
      `${image.destination}/${image.filename}`
    );
    const resize = (size) => {
      let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`;
      addresImages[size] = this.getUrlImage(
        `${image.destination}/${imageName}`
      );

      sharp(image.path)
        .resize(size, null)
        .toFile(`${image.destination}/${imageName}`);
    };
    [1080, 720, 480].map(resize);
    return addresImages;
  }
  getUrlImage(dir) {
    return dir.substring(8);
  }
  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
  }
}

module.exports = new courseController();
