const controller = require("./Controller");
const axios = require("axios");
const Payment = require("../../models/payment");
const ActivationCode = require("../../models/activationCode");

class userController extends controller {
  async index(req, res) {
    try {
      res.render("home/panel/index", { title: "پنل کاربری" });
    } catch (err) {
      err.status = 404;
      next(err);
    }
  }
  async history(req, res, next) {
    try {
        let page = req.query.page || 1;
    const payments = await Payment.paginate(
      { user: req.user.id },
      { page, sort: { createdAt: -1 }, limit: 5, populate: "course" }
    );
    res.render("home/panel/history", { title: "پنل کاربری", payments });
    } catch (err) {
        err.status = 403;
        next(err)
    }
  }
  async vip(req, res) {
    res.render("home/panel/vip", { title: "عضویت ویژه" });
  }
  async vipPayment(req, res, next) {
    try {
        let plan = req.body.plan;
        let price = 0;
        switch (plan) {
            case '3':
                price = 50000;   
            break;
            case '12':
                price = 90000; 
            break;
            default:
                price = 30000;
            break;
        }
      // buy proccess
      let params = {
        MerchantID: "fa77bdb8-c4f6-4852-bb7d-db1dd6b10713",
        Amount: price,
        CallbackURL: "http://localhost:3000/user/panel/vip/payment/checker",
        Description: `افزایش اعتبار ویژه`,
        Email: req.user.email,
      };
      let options = this.getUrlOption(
        "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
        params
      );

      axios(options)
        .then(async (response) => {
          let payment = new Payment({
            user: req.user.id,
            vip: true,
            price: price,
            resnumber: response.data.Authority,
          });
          await payment.save();

          if (response.data.Status == 100) {
            return res.redirect(
              `https://sandbox.zarinpal.com/pg/StartPay/${response.data.Authority}`
            );
          }
        })
        .catch((err) => {
          return res.json(err.message);
        });
    } catch (err) {
      next(err);
    }
  }
  async vipPaymentChecker(req, res, next) {
    try {
        let payment = await Payment.find({resnumber: req.query.Authority}).exec();
      //return res.json(payment)
      if(req.query.Status && req.query.Status !== "OK"){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'پرداخت با موفقیت انجام نشد',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        return res.redirect(`/user/panel/vip`);
      }
      if(!payment[0].vip){
        this.alert(req, {
          title: 'دقت کنید',
          message: 'این تراکنش مربوط به افزایش اعتبار ویژه نمیشود',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        return this.back(req, res);
      }
      let params = {
        MerchantID : 'fa77bdb8-c4f6-4852-bb7d-db1dd6b10713',
        Amount : payment[0].price,
        Authority : req.query.Authority
      }
      let options = this.getUrlOption(
        'https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json',
         params
      );
      axios(options).then(async response => {
        if(response.data.Status == 100){
          payment[0].set({payment: true});

          let time = 0,
              type = '';

          switch (payment[0].price) {
            case 30000:
                  time = 1;
                  type = 'month'
            break;
            case 50000:
                time = 3;
                type = '3month'
            break;
            case 90000:
                  time = 12;
                  type = '12month'
            break;
          }
        if(time == 0) {
            this.alert(req , {
                title : 'دقت کنید',
                message : 'عملیات مورد نظر با موفقیت انجام نشد',
                type : 'success',
                icon: 'success',
                button : 'بسیار خوب'
            })
            return res.redirect('/user/panel/vip')
        }

          let vipTime = req.user.isVip() ? new Date(req.user.vipTime) : new Date();
          vipTime.setMonth(vipTime.getMonth() + time);

          req.user.set({vipTime, vipType: type})
          await req.user.save();

          await payment[0].save();

          this.alert(req, {
            title: 'با تشکر',
            message: 'پرداخت شما با موفقیت انجام شد',
            icon: 'success',
            type: 'success',
            button: 'اوک'
          })
          return res.redirect(`/user/panel/vip`)
        }else{
          this.alert(req, {
            title: 'دقت کنید',
            message: 'پرداخت با موفقیت انجام نشد',
            icon: 'error',
            type: 'error',
            button: 'اوک'
          })
          return res.redirect(`/user/panel/vip`);
        }
      }
      ).catch(err => {
        err.status = 500;
        next(err)
      })
    } catch (err) {
        next(err)
    }
  }

  async activationCode(req, res, next){
    try {
      let activationCode = await ActivationCode.findOne({code: req.params.code}).populate('user').exec();
      if(!activationCode){
        this.alert(req, {
          title: 'توجه کنید',
          message: 'چنین لینک فعالسازی وجود ندارد',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        res.redirect('/')
        return;
      }
      if(activationCode.expire < new Date()){
        this.alert(req, {
          title: 'توجه کنید',
          message: 'فرصت استفاده از این لینک به پایان رسیده از طریق فرم ورود دوباره اقدام کنید',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        res.redirect('/')
        return;
      }
      if(activationCode.used){
        this.alert(req, {
          title: 'توجه کنید',
          message: 'این لینک قبلا استفاده شده است',
          icon: 'error',
          type: 'error',
          button: 'اوک'
        })
        res.redirect('/')
        return;
      }
      let user = activationCode.user;
      user.$set({active: true});
      activationCode.$set({used: true});

      await user.save();
      await activationCode.save();

      req.login(user, function (err) {
          user.setRememberToken(res);
          
      });
      this.alert(req, {
        title: 'با تشکر',
        message: 'اکانت شما فعال شد',
        icon: 'success',
        type: 'success',
        button: 'بسیار خب'
      })
      return res.redirect("/");

    } catch (err) {
      next(err)
    }
  }

  getUrlOption(url, param) {
    return {
      method: "POST",
      url: url,
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      data: param,
      json: true,
    };
  }
}

module.exports = new userController();
