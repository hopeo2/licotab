let ConnectRoles = require('connect-roles');
let Permission = require('../../models/permission');
 
let gate = new ConnectRoles({
  failureHandler: function (req, res, action) {
    var accept = req.headers.accept || '';
    res.status(403);
    if (accept.indexOf('html')) {
      res.render('errors/403', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

const permission = async () => {
    return await Permission.find({}).populate('roles').exec();
}

permission().then((permissions) => {
    permissions.forEach(permission => {
        let roles = permission.roles.map(per => per._id)
        gate.use(permission.name, (req)=>{
            return (req.isAuthenticated()) ? req.user.hasRole(roles) : false;
        })
    })
})




module.exports = gate;