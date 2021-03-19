const Controller = require('../controllers/Controller')

class ErrorHandller extends Controller {
  async error404(req, res, next) {
    try {
      this.error('چنین صفحه ای یافت نشد', 404)
  } catch(err) {
      next(err)
  }
  }
  async handller(err, req, res, next) {
    const statusCode = err.status || 500;
    const message = err.message || "";
    const stack = err.stack || "";

    const layouts = {
      layout: "errors/layout",
    };

    if (config.debug)
      return res.render("errors/stack", {
        ...layouts,
        message,
        stack,
        title: "خطا",
      });

    return res.render(`errors/${statusCode}`, {
      ...layouts,
      message,
      stack,
      title: "خطا",
    });
  }
};

module.exports = new ErrorHandller();
