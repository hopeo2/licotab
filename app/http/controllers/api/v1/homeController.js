const Controller = require("../controller");
const passport = require("passport")
const jwt = require("jsonwebtoken")
const User = require("../../../../models/user");
const Payment = require("../../../../models/payment");

class homeController extends Controller {
    
    async index(req, res, next){
        let user = await req.user
            .populate({path: 'roles', populate: [{path: 'permissions'}]}).execPopulate();
        return res.json({
            status: 'success',
            data: this.filterUserData(user),
        })
    }
    async history(req , res , next) {
        try {
            let page = req.query.page || 1;
            let payments = await Payment.paginate({ user : req.user.id } , { page , sort : { createdAt : -1} , limit : 20 , populate : [{path: 'course'}, {path: 'user', select: 'name email'}]});
        
            res.json({
                status : 'success',
                data : this.filterPaymentData(payments),
            })     
        } catch (err) {
            this.faild(err.message , res);
        }
    }
    filterUserData(user){
        return {
            name: user.name,
            admin: user.admin,
            email: user.email,
            id: user.id,
            createdAt: user.createdAt,
            roles: user.roles.map(role=>{
                return {
                    name: role.name,
                    label: role.label,
                    permissions: role.permissions.map(per=>{
                        return {
                            name: per.name,
                            label: per.label
                        }
                    })
                }
            })
        }
    }
    filterPaymentData(payments) {
        return {
            ...payments,
            docs : payments.docs.map(pay => {
                return {
                    payment : pay.payment,
                    resnumber : pay.resnumber,
                    price : pay.price,
                    user: {
                        name : pay.user.name,
                        email : pay.user.email
                    }
                }
            })
        }
    }

}

module.exports = new homeController();