let express = require("express");
let router = express.Router();

const fs = require("fs");
const mysql = require("../utils/db");
let moment = require("moment");
const async = require("async");

router.get('/', function (req, res, next) {
    //res.send("blog 首页");
    let configData = fs.readFileSync(__dirname + "/../utils/sysconf.json");
    let sysConf = JSON.parse(configData.toString());
    let newstypeData = [];
    let sliderData = [];
    let newsData = [];
    let hotnewsData = [];
    async.series({
        one: function (done) {
            mysql.query("select id,name from newstype order by sort", function (err, newstypeData) {
                if (err) { }
                else { newstypeData = newstypeData; }
            });
            done(nul, 1);
        },
        two: function (done) {
            mysql.query("select * from slider order by sort", function (err, sliderData) {
                if (err) { }
                else { sliderData = sliderData; }
            });
            done(nul, 2);
        },
        three: function (done) {
            mysql.query("select a.*,b.name as tname from news a left join newstype b on a.cid=b.id order by a.num", function (err, newsData) {
                if (err) { }
                else {
                    newsData.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });
                    newsData = newsData;
                }
            });
            done(nul, 3);
        },
        four: function (done) {
            mysql.query("select a.*,b.name as tname from news a left join newstype b on a.cid=b.id order by a.num limit 5", function (err, newshotnewsData) {
                if (err) { }
                else {
                    hotnewsData.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DDWS");
                    });
                    hotnewsData = hotnewsData;
                }
            });
            done(nul, 4);
        },
    },
        function (err, res) {
            res.render("home/index.html",
                {
                    sysConf: sysConf,
                    newstypeData: newstypeData,
                    sliderData: sliderData,
                    newsData: newsData,
                    hotnewsData: hotnewsData
                });
        });
});

router.get('/list', function (req, res, next) {
    res.send("blog 列表页面");
});


router.get('/news', function (req, res, next) {

    let configData = fs.readFileSync(__dirname + "/../utils/sysconf.json");
    let sysConf = JSON.parse(configData.toString());
    mysql.query("select id,name from newstype order by sort", function (err, newstypeData) {
        if (err) { }
        else {
            res.render("home/news.html",
                {
                    sysConf: sysConf,
                    newstypeData: newstypeData,
                });
        }
    });
});


router.get('/login', function (req, res, next) {
    res.send("blog 登录页面");
});


router.get('/register', function (req, res, next) {
    res.send("blog 注册页面");
});

module.exports = router;