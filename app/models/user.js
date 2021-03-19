const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const uniqueString = require('unique-string');
var mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    active: {type: Boolean, default: false},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    admin: {type: Boolean, default: 0},
    rememberToken: {type: String, default: null},
    vipTime: {type: Date, default: new Date().toISOString()},
    vipType: {type: String, default: 'month'},
    learning: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
}, {timestamps: true, toJSON: {virtuals: true}});

userSchema.plugin(mongoosePaginate); 



userSchema.pre('findOneAndUpdate', function(next){
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(this.getUpdate().$set.password, salt);
    this.getUpdate().$set.password = hash;
    next()
})
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password , this.password);
}

userSchema.methods.hasRole = function(roles){
    let result = roles.filter(role => {
        return this.roles.indexOf(role) > -1;
    })
    return !! result.length;
}

userSchema.methods.setRememberToken = function(res){
    const token = uniqueString()
    res.cookie('remember_token', token, {maxAge: 1000 * 60 * 60 * 24 * 30, signed: true})
    this.updateOne({rememberToken: token}, err => {
        if(err) console.log(err)
    })
}

userSchema.methods.isVip = function(){
    return new Date(this.vipTime) > new Date();
} 

userSchema.methods.isBuy = function(courseId) {
    return this.learning.indexOf(courseId) !== -1;
}

userSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'user'
})


module.exports = mongoose.model('User', userSchema)