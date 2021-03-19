const controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const Comment = require("../../../models/comment");

class commentController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let comments = await Comment.paginate(
        { aproved: true },
        {
          page,
          sort: { createdAt: -1 },
          limit: 2,
          populate: [
            { path: "user", select: "name" },
            "course",
            { path: "episode", populate: [{ path: "course", select: "slug" }] },
          ],
        }
      );
      res.render("admin/comments/index", { title: "کامنت ها", comments });
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  async aproved(req, res, next) {
    try {
      let page = req.query.page || 1;
      let comments = await Comment.paginate(
        { aproved: false },
        {
          page,
          sort: { createdAt: -1 },
          limit: 20,
          populate: [
            {
              path: "user",
              select: "name",
            },
            "course",
            {
              path: "episode",
              populate: [
                {
                  path: "course",
                  select: "slug",
                },
              ],
            },
          ],
        }
      );
      res.render("admin/comments/approved", {
        title: "کامنت های تایید نشده",
        comments,
      });
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next){
    try {
        this.isMongoId(req.params.id);
        let comment = await Comment.findById(req.params.id).populate('belongTo').exec();
        if (!comment) this.error("چنین کامنتی وجود ندارد", 404);

        await comment.belongTo.inc("commentCount", 1)

        comment.aproved = true;
        await comment.save();
        return this.back(req, res);
    } catch (err) {
      res.status = 404;
      next(err)
    }
  }
  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);

      let comment = await Comment.findById(req.params.id).exec();
      if (!comment) this.error("چنین کامنتی وجود ندارد", 404);

      // delete courses
      comment.remove();

      return this.back(req, res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new commentController();
