const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', trim: true},
    comment: {type: String, required: true, trim: true},
    aproved: {type: Boolean, default: false, trim: true},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, trim: true},
    course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course', trim: true, default: undefined},
    episode: {type: mongoose.Schema.Types.ObjectId, ref: 'Episode', trim: true, default: undefined}
}, {timestamps: true, toJSON: {virtuals: true}});

commentSchema.plugin(mongoosePaginate); 

commentSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parent'
})
const commentBelong = doc => {
    if(doc.course) 
        return 'Course';
    else if(doc.episode)
        return 'Episode'
}

commentSchema.virtual('belongTo' , {
    ref : commentBelong,
    localField : doc => commentBelong(doc).toLowerCase(),
    foreignField : '_id',
    justOne : true
})


module.exports = mongoose.model('Comment', commentSchema) 