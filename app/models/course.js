const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

const courseSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', trim: true},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
    title: {type: String, required: true, trim: true},
    slug: {type: String, required: true, trim: true},
    body: {type: String, required: true, trim: true},
    price: {type: String, required: true, trim: true},
    type: {type: String, required: true, trim: true},
    images: {type: Object, required: true},
    thumb: {type: String, required: true},
    tags: {type: String, required: true, trim: true},
    time: {type: String, default: '00:00:00', trim: true},
    viewCount : { type : Number , default : 0 },
    commentCount: {type: Number, default: 0},
}, {timestamps: {updateAt: false} , toJSON: {virtuals: true}})

courseSchema.plugin(mongoosePaginate); 

courseSchema.methods.path = function(){
    return `/all-course/${this.slug}`
} 

courseSchema.methods.inc = async function(field,num){
    this[field] += num;
    await this.save();
}


courseSchema.virtual('episodes', {
    ref: 'Episode',
    localField: '_id',
    foreignField: 'course'
})
courseSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'course'
})


module.exports = mongoose.model('Course', courseSchema) 