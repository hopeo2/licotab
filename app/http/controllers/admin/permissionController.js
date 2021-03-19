const Controller = require("../Controller");
const { check, validationResult } = require("express-validator");
const Permission = require("../../../models/permission");

class permissionController extends Controller{
    async index(req, res, next){
        try {
            let page = req.query.page || 1;
            let permissions = await Permission.paginate({} , { page , sort : { createdAt : 1 } , limit : 20 });

            res.render('admin/permissions/index',  { title : 'لیست اجازه دسترسی' , permissions });
        } catch (err) {
            next(err);
        }
    };
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
    async create(req, res, next){
        res.render('admin/permissions/create', {errors: req.flash('errors')});  
    };
    async store(req, res, next){
        try {
            let { name , label } = req.body;

            let newPermission = new Permission({ 
                name,
                label
             });

            await newPermission.save();

            return res.redirect('/admin/users/permissions');  
        } catch(err) {
            next(err);
        }
    };
    async edit(req, res, next){
        try {
            this.isMongoId(req.params.id);

            let permission = await Permission.findById(req.params.id);
            if( ! permission ) this.error('چنین اجازه دسترسی وجود ندارد' , 404);


            return res.render('admin/permissions/edit' , { permission, errors: req.flash('errors') });
        } catch (err) {
            next(err);
        }
    }
    async update(req, res, next){
        try {
            let {name, label} = req.body;
            await Permission.findByIdAndUpdate(req.params.id, {$set: {
                name,
                label
            }})
            return res.redirect('/admin/users/permissions');
        } catch (err) {
            err.status = 500;
            next(err)
        }
    };
    async destroy(req, res, next){
        try {
            this.isMongoId(req.params.id);

            let permission = await Permission.findById(req.params.id).exec();
            if( ! permission ) this.error('چنین اجازه دسترسی وجود ندارد' , 404);

            // delete category
            permission.remove();

            return res.redirect('/admin/users/permissions');
        } catch (err) {
            next(err);
        }
    };
};

module.exports = new permissionController();