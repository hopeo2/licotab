const controller = require("./Controller");
const axios = require('axios');
const { check, validationResult } = require("express-validator");
const User = require("../../models/user");
const Payment = require("../../models/payment");
const Course = require("../../models/course");
const Episode = require("../../models/episode");
const Comment = require("../../models/comment");
const Category = require("../../models/category");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

class allCourseController extends controller {
  async allcourse(req, res, next) {
    try {
      let query = {};

      if (req.query.search) {
        query.title = new RegExp(req.query.search, "gi");
      }
      if (req.query.type && req.query.type != "all") {
        query.type = req.query.type;
      }
      if (req.query.category && req.query.category != "all") {
        let category = await Category.findOne({ slug: req.query.category });
        if (category) {
          query.categories = { $in: [category.id] };
        }
      }
      let page = req.query.page || 1;
      let courseSearch = await Course.paginate({ ...query }, {page, limit: 6});


      // if (req.query.order) {
      //   courseSearch.sort({ createdAt: -1 });
      // }
      //courseSearch = await courseSearch.exec();

      let categories = await Category.find({});
      let lastCourse = await Course.find({}).sort({createdAt: -1}).limit(2).exec();
      //return res.json(lastCourse)

      return res.render("home/allCourse.ejs", {
        layout: "home/layout",
        title: "دوره ها",
        courseSearch,
        categories,
        lastCourse
      });
    } catch (err) {
      err.status = 404;
      next(err);
    }
  }
  //Single Course Page **************************************
  async single(req, res, next) {
    try {
      let course = await Course.findOneAndUpdate(
        { slug: req.params.course },
        { $inc: { viewCount: 1 } }
      )
        .populate([
          { path: "user", select: "name" },
          { path: "episodes", options: { sort: { number: -1 } } },
        ]).populate({path: 'categories'})
        .populate([
          {
            path: "comments",
            match: { parent: { $eq: null }, aproved: true },
            populate: [
              { path: "user", select: "name" },
              {
                path: "comments",
                match: { aproved: true },
                populate: { path: "user", select: "name" },
              },
            ],
          },
        ]);
        //res.json(course.categories)
        if(!course){
          this.error('چنین صفحه ای یافت نشد', 404)
        }

      
      let categories = await Category.find({ parent: null }) 
        .populate("childs")
        .exec();
      res.render("home/single-course", {
        course,
        title: course.title,
        errors: req.flash("errors"),
        success: req.flash("success"),
        categories,
        layout: 'home/layout'
      });
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  //Create Comment ------------------------------------------------
  async comment(req, res, next) {
    try {
      let newComment = new Comment({
        user: req.user.id,
        course: req.body.course,
        ...req.body,
      });
      await newComment.save();
      this.alert(req, {
        title: 'با تشکر',
        message: 'کامنت شما ثبت شد و در انتظار تایید است',
        icon: 'success',
        type: 'success',
        button: 'success'
      })
      return this.back(req, res);
    } catch (err) {
      res.status = 404;
      next(err);
    }
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
      this.back(req, res);
    } else {
      next();
    }
  }
  //Payment ------------------------------------------------
  async payment(req, res, next){
    try {
      this.isMongoId(req.body.course);

      let course = await Course.findById(req.body.course);
      if(!course){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'دوره مورد نظر یافت نشد',
          icon: 'error',
          type: 'error',
        })
        return this.back(req, res);
      }
      if(await req.user.isBuy(course)){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'شما قبلا این دوره را خریداری کرده اید',
          icon: 'warning',
          type: 'warning',
          button: 'آهااا'
        })
        return this.back(req, res);
      }
      if(course.price == 0 && (course.type == 'vip' || course.type == 'free')){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'این دوره مخصوص اعضای ویژه یا رایگان است و قابل خریداری نیست',
          icon: 'warning',
          type: 'warning',
          button: 'آهااا'
        })
        return this.back(req, res);
      }
      // buy proccess
      let params = {
        MerchantID : 'fa77bdb8-c4f6-4852-bb7d-db1dd6b10713',
        Amount : course.price,
        CallbackURL : 'http://localhost:3000/all-course/payment/checker',
        Description: `خرید دوره ${course.title}`,
        Email : req.user.email,
      };
      let options = this.getUrlOption(
        'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json',
        params
      );

      axios(options)
        .then(
          async response => {
            let payment = new Payment({
              user: req.user.id,
              course: course.id,
              price: course.price,
              resnumber: response.data.Authority,
            })
            await payment.save()

            if(response.data.Status == 100){
              return res.redirect(`https://sandbox.zarinpal.com/pg/StartPay/${response.data.Authority}`);
            }
          }
        )
        .catch(
          err => {
            return res.json(err.message)
          }
        );


    } catch (err) {
      err.status = 500;
      next(err);
    }
  }

  async checker(req, res, next){
    try {
      let payment = await Payment.find({resnumber: req.query.Authority}).populate('course').exec();
      //return res.json(payment)
      if(req.query.Status && req.query.Status !== "OK"){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'پرداخت با موفقیت انجام نشد',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        return res.redirect(`/all-course/${payment[0].course.slug}`);
      }
      if(!payment[0].course){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'دوره ای که شما برای پرداخت آن اقدام کرده اید وجود ندارد',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        return this.back(req, res);
      }
      let params = {
        MerchantID : 'fa77bdb8-c4f6-4852-bb7d-db1dd6b10713',
        Amount : payment[0].course.price,
        Authority : req.query.Authority
      }
      let options = this.getUrlOption(
        'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json',
         params
      );
      axios(options).then(async response => {
        if(response.data.Status == 100){
          payment[0].set({payment: true});
          req.user.learning.push(payment[0].course.id);

          await payment[0].save();
          await req.user.save();

          this.alert(req, {
            title: 'با تشکر',
            message: 'پرداخت شما با موفقیت انجام شد',
            icon: 'success',
            type: 'success',
            button: 'اوک'
          })
          return res.redirect(`/all-course/${payment[0].course.slug}`)
        }else{
          this.alert(req, {
            title: 'دقت کنید',
            message: 'پرداخت با موفقیت انجام نشد',
            icon: 'error',
            type: 'error',
            button: 'اوک'
          })
          return res.redirect(`/all-course/${payment[0].course.slug}`);
        }
      }
      ).catch(err => {
        err.status = 500;
        next(err)
      })
      
    } catch (err) {
      err.status = 500;
      next(err)
    }
  }

  async download(req, res, next) {
    try {
      this.isMongoId(req.params.episode);
      let episode = await Episode.findById(req.params.episode);
      if (!episode) this.error("چنین جلسه ای وجود ندارد", 404);
      if (!this.checkHash(req, episode))
        this.error("اعتبار لینک شما به پایان رسیده است", 403);

      let filePath = path.resolve(`./public/${episode.videoUrl}`);

      if (!fs.existsSync(filePath))
        this.error("چنین فایل برای دانلود وجود دارد", 404);

      await episode.inc("downloadCount", 1);
      return res.download(filePath);
    } catch (err) {
      res.status = 404;
      next(err);
    }
  }
  
  checkHash(req, episode) {
    let timestamps = new Date().getTime();
    if (req.query.t < timestamps) return false;
    let text = `aQTR@!#Fa#%!@xs%SDQGGASDF${episode.id}${req.query.t}`;
    return bcrypt.compareSync(text, req.query.mac);
  }
  getUrlOption(url, param){
    return {
      method : 'POST',
      url : url,
      headers : {
          'cache-control' : 'no-cache',
          'content-type' : 'application/json'
      },
      data : param,
      json: true
    }
  }
}

module.exports = new allCourseController();
