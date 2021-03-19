const controller = require("../Controller");
let Course = require("../../../models/course");

class adminController extends controller {
  async index(req, res) {
    let page = req.query.page || 1;
    let courses = await Course.paginate(
      {},
      { page, sort: { createdAt: -1 }, limit: 10, populate: 'user' }
    );  

    res.render("admin/index", { title: "پنل ادمین", courses });
  }
  uploadImage(req, res) {
    let image = req.file;
    res.json({
      uploaded: 1,
      fileName: image.originalname,
      url: `${image.destination}/${image.filename}`.substring(8),
    });
  }
}

module.exports = new adminController();
