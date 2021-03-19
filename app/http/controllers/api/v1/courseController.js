const Controller = require("../controller");
const Course = require("../../../../models/course");
const Comment = require("../../../../models/comment");
const passport = require("passport");

class CourseController extends Controller {
    async courses(req, res, next){
        try {
            let page = req.query.page || 1;
            let courses = await Course.paginate(
              {},
              { page, sort: { createdAt: -1 }, limit: 12 , populate : [ { path : 'categories' } , { path : 'user'}] }
            ); 
            res.json({
                status: 'success',
                data: this.filterCoursesData(courses),
            })
        } catch (err) {
            this.faild(err.message, res)
        }
    }

    async singleCourse(req, res){
        try {
            let course = await Course.findByIdAndUpdate(
                req.params.course ,
                { $inc: { viewCount: 1 } }
              )
                .populate([
                  { path: "user", select: "name" },
                  { path: "episodes", options: { sort: { number: -1 } } },
                  {path: "categories", select: "name slug"}
                ]);
            if(!course) return this.faild('چنین دوره ای وجود ندارد', res, 404);

            passport.authenticate('jwt', {session: false}, (err, user, info)=>{
                
                res.json({
                    status: 'success',
                    data: this.filterCourseData(course, user),
                })
                
            })(req, res);
                
        } catch (err) {
            this.faild(err.message, res)
        }
    }

    async commentForSingleCourse(req, res, next){
        try {
            let comment = await Comment.find({course: req.params.course, parent: null, aproved: true})
                .populate([{
                    path: 'user',
                    select: 'name'
                }, {
                    path: 'comments',
                    match: {aproved: true},
                    populate: {path: 'user', select: 'name'}
                }]);
            res.json({
                status: 'success',
                data: comment,
            })
        } catch (err) {
            this.faild(err.message, res);
        }
    }
    filterCoursesData(courses) {
        return { 
            ...courses,
            docs : courses.docs.map(course => {
                return {
                    id : course.id,
                    title : course.title,
                    slug : course.slug,
                    body : course.body,
                    image : course.thumb,
                    categories : course.categories.map(cate => {
                        return {
                            name : cate.name,
                            slug : cate.slug
                        }
                    }),
                    user : {
                        id : course.user.id,
                        name : course.user.name
                    },
                    price : course.price,
                    createdAt : course.createdAt
                }
            })
        }
    }
    filterCourseData(course, user){
        return {
            id : course.id,
            title : course.title,
            slug : course.slug,
            body : course.body,
            image : course.thumb,
            categories : course.categories.map(cate => {
                return {
                    name : cate.name,
                    slug : cate.slug
                }
            }),
            user : {
                id : course.user.id,
                name : course.user.name
            },
            episodes : course.episodes.map(episode => {
                return {
                    time : episode.time,
                    downloadCount : episode.downloadCount,
                    viewCount : episode.viewCount,
                    commentCount : episode.commentCount,
                    id : episode.id,
                    title : episode.title,
                    body : episode.body,
                    type : episode.type,
                    number : episode.number,
                    createdAt : episode.createdAt,
                    download : episode.download(!! user , user)
                }
            }) ,
            price : course.price,
            createdAt : course.createdAt
        }
    }

}

module.exports = new CourseController();