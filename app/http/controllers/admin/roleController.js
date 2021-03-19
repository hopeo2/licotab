const controller = require('../Controller');
const Role = require('../../../models/role');
const { check, validationResult } = require("express-validator");
const Permission = require('../../../models/permission');

class roleController extends controller {
    async index(req , res) {
        try {
            let page = req.query.page || 1;
            let roles = await Role.paginate({} , { page , sort : { createdAt : 1 } , limit : 20 });

            res.render('admin/roles/index',  { title : 'سطوح دسترسی' , roles });
        } catch (err) {
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
          if (req.file) fs.unlinkSync(req.file.path);
          this.back(req, res);
        } else {
          next();
        }
    }

    async create(req , res) {
        let permissions = await Permission.find({})
        res.render('admin/roles/create' , { permissions, errors: req.flash('errors') });        
    }

    async store(req , res , next) {
        try {
        
            let { name , label , permissions } = req.body;

            let newRole = new Role({ 
                name,
                label,
                permissions
             });

            await newRole.save();

            return res.redirect('/admin/users/roles');  
        } catch(err) {
            next(err);
        }
    };

    async edit(req, res ,next) {
        try {
            this.isMongoId(req.params.id);

            let role = await Role.findById(req.params.id);
            let permissions = await Permission.find({})

            if( ! role ) this.error('چنین سطح دسترسی وجود ندارد' , 404);


            return res.render('admin/roles/edit' , { role  ,permissions, errors: req.flash('errors') });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res , next) {
        try {

            let { name , label , permissions } = req.body;
            
            await Role.findByIdAndUpdate(req.params.id , { $set : { 
                name,
                label,
                permissions
             }})

            return res.redirect('/admin/users/roles');
        } catch(err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let role = await Role.findById(req.params.id);
            if( ! role ) this.error('چنین سطح دسترسی وجود ندارد' , 404);

            // delete category
            role.remove();

            return res.redirect('/admin/users/roles');
        } catch (err) {
            next(err);
        }
    }

}

module.exports = new roleController();