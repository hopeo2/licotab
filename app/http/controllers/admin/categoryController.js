const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const Category = require("../../../models/category");

class categoryController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let categories = await Category.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 20, populate: "parent" }
      );

      res.render("admin/categories/index", { title: "دسته ها", categories });
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }

  async create(req, res) {
    let categories = await Category.find({ parent: null });
    res.render("admin/categories/create", {
      categories,
      errors: req.flash("errors"),
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
      this.back(req, res);
    } else {
      next();
    }
  }
  async store(req, res, next) {
    try {
      let { name, parent } = req.body;
      let newCategory = new Category({
        name,
        slug : this.slug(name),
        parent: parent !== "none" ? parent : null,
      });
      await newCategory.save();

      return res.redirect("/admin/categories");
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id);

      let category = await Category.findById(req.params.id);
      let categories = await Category.find({ parent: null });
      if (!category) this.error("چنین دسته ای وجود ندارد", 404);

      return res.render("admin/categories/edit", {
        category,
        categories,
        errors: req.flash("errors"),
      });
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  async update(req, res, next) {
    try {
        let {name , parent} = req.body;
        await Category.findByIdAndUpdate(req.params.id, {$set: {
            name,
            slug: this.slug(name),
            parent: parent !== 'none' ? parent : null,
        }})
        return res.redirect('/admin/categories')
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let category = await Category.findById(req.params.id)
        .populate("childs")
        .exec();
      if (!category) return this.error("چنین دسته ای وجود ندارد", 404);
      category.childs.forEach((cat) => cat.remove());
      category.remove();
      return this.back(req, res);
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
}

module.exports = new categoryController();
