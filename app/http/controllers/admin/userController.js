const controller = require('../Controller');
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcrypt')
const User = require('../../../models/user');
const Role = require('../../../models/role');


class userController extends controller {
    async index(req, res){
        let page = req.query.page || 1;
        const users = await User.paginate(
            {},{page, sort: {createdAt: -1} , limit: 5}
        );
        res.render('admin/users/index', { title : 'کاربران سایت' , users });
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
    async toggleadmin(req, res, next){
        try {
            this.isMongoId(req.params.id);
            let user = await User.findById(req.params.id);
            if(!req.userCan('toggle-admin')){
                this.error('شما دسترسی ندارید', 403)
            }
            
            user.set({admin: !user.admin});
            await user.save();
            return this.back(req, res);
        } catch (err) {
            next(err)
        }
    }
    async create(req, res, next){
        res.render('admin/users/create', 
        {errors: req.flash("errors"),
        title: "ایجاد کاربر",}
        ); 
    }
    async store(req, res, next){
        try {
            let {name, email, password} = req.body;
            let hashpassword;
            bcrypt.hash(password, 10, async(err, hash) => {
                if(err) console.log(err)
                hashpassword = hash;

                let newUser = await new User({
                    name,
                    email,
                    password: hashpassword
                })
                await newUser.save();
                this.alert(req, {
                    title: 'انجام شد',
                    message: 'کاربر با موفقیت ایجاد شد',
                    icon: 'success',
                    type: 'success',
                    button: 'اوک'
                })
                return res.redirect("/admin/users")
            });
            
        } catch (err) {
            err.status = 500;
            next(err);
        }
    }
    async addrole(req, res, next){
        try {
            this.isMongoId(req.params.id);
            
            let user = await User.findById(req.params.id);
            let roles = await Role.find({});
            if( ! user ) this.error('چنین کاربری وجود ندارد' , 404);

            if(!req.userCan('show-users')){
                this.error('شما دسترسی ندارید', 403)
            }
        
            res.render('admin/users/addrole', { user , roles, errors: req.flash('errors') });            
        } catch (err) {
            next(err);
        }
    } 

    async storeRoleForUser(req, res, next){
        try {
            this.isMongoId(req.params.id);
            let user = await User.findById(req.params.id);
            if( ! user ) this.error('چنین کاربری وجود ندارد' , 404);

            user.set({ roles : req.body.roles });
            await user.save();

            res.redirect('/admin/users');
        } catch (err) {
            err.status = 500;
            next(err);
        }
    } 

    async destroy(req, res, next){
        try {
            this.isMongoId(req.params.id);
        let user = await User.findById(req.params.id)
            .populate({path: 'courses', populate: ['episodes']}).exec();
        if(!user){
            this.error('چنین کاربری وجود ندارد' , 404);
        }
        if(!req.userCan('delete-users')){
            this.error('شما دسترسی ندارید', 403)
        }
        user.courses.forEach(async course => {
            course.episodes.forEach(async episode => {await episode.remove()})
            await course.remove()
        });
        //delete user
        await user.remove();
        this.alert(req, {
            title: 'انجام شد',
            message: 'کاربر با موفقیت حذف شد',
            icon: 'success',
            type: 'success',
            button: 'اوک'
        })
        return this.back(req, res);
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new userController(); 