const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const uniqueString = require('unique-string');

const passSchema = mongoose.Schema({
    email: {type: String, required: true, trim: true},
    token: {type: String, required: true, trim: true},
    use: {type: Boolean, default: false}
}, {timestamps: {updateAt: false}})



module.exports = mongoose.model('passwordReset', passSchema) 