const controller = require("./Controller");
const Course = require("../../models/course");
const User = require('../../models/user');
const { SitemapStream, streamToPromise } = require("sitemap");
const { createGzip } = require("zlib");
const rss = require('rss');
const striptags = require('striptags');


class homeController extends controller {
  async index(req, res, next) {
    try { 
        let courses = await Course.find({viewCount: {$gt : 50}}).sort({ createdAt: -1 }).exec();
        let totalCourse = await Course.find({}).exec(); 
        let course = await Course.find({commentCount: {$gt : 0}}).populate([ 
          {
            path: "comments",
            match: { parent: { $eq: null }, aproved: true },
            populate: [
              { path: "user", select: "name" },
              {
                path: "comments",
                match: { aproved: true },
                populate: { path: "user", select: "name" },
              },
            ],
          },
        ]).populate([{path: 'categories'}]).sort({createdAt: -1}).limit(2).exec(); 
        //return res.json(course)
        
        let user = await User.find({});
        res.render("home/home", { title: "صفحه اصلی", courses, course, user, totalCourse });
    } catch (err) {
      err.status = 404;
        next(err)
    } 
  }
  async about(req, res) {
    try {
      return res.render("home/about.ejs", {
        layout: "home/layout",
        title: "درباره ما",
      });
    } catch (err) {
      err.status = 404;
      next(err)
    }
  }
  async sitemap(req, res, next) {
    let sitemap;
    res.header("Content-Type", "application/xml");
    res.header("Content-Encoding", "gzip");
    // if we have a cached entry send it
    if (sitemap) {
      res.send(sitemap);
      return;
    }
    try {
    
        const smStream = new SitemapStream({ hostname: 'http://localhost:3000' })
        const pipeline = smStream.pipe(createGzip())
        smStream.write({ url: '/',  changefreq: 'daily', priority: 1 })
        smStream.write({ url: '/all-course', priority: 1 })
        let courses = await Course.find({}).sort({createdAt: -1}).exec();
        courses.forEach(course => {
            smStream.write({ url: course.path(),  changefreq: 'weekly', priority: 0.8 })
        })

        streamToPromise(pipeline).then(sm => sitemap = sm)
        smStream.end()
        // stream write the response
        pipeline.pipe(res).on('error', (e) => {throw e})

    } catch (err) {
      next(err);
    }
  }
  async courseFeed(req, res, next) {
    try {
        let feed = new rss({
            title : 'فید خوان دوره های راکت',
            description : 'جدیدترین دوره ها را از طریق rss بخوانید',
            feed_url : `${config.siteurl}/feed/courses`,
            site_url : config.site_url,
        });

        let courses = await Course.find({ }).populate('user').sort({ createdAt : -1 }).exec();
        courses.forEach(course => {
            feed.item({
                title : course.title,
                description : striptags(course.body.substr(0, 100)),
                date : course.createdAt,
                url : course.path(),
                author : course.user.name,
            })
        })

        res.header('Content-type' , 'application/xml');
        res.send(feed.xml());

    } catch (err) {
        next(err);
    }
  }
}

module.exports = new homeController();
