let express = require("express");

let router = express.Router();

const mysql = require("../utils/db");
const crypto = require("crypto");
//监听用户访问地址
router.use(function (req, res, next) {
    console.log(req.url);
    if (req.url != "/login" && req.url != "/check") {
        if (req.session.YzmMessageIsAdmin && req.session.YzmMessageUsername) {
            next();
        } else { res.send("<script>alert('请登录！');window.location.href='/admin/login';</script>"); }
    }
    else {

        next();

    }
});


router.get("/login", function (req, res, next) {
    res.render("admin/login.html");
});

router.post('/check', function (req, res, next) {
    //res.send("管理员管理");
    let { username, password } = req.body;
    let flag = false;
    if (username) {
        if (password) {
            let md5 = crypto.createHash("md5");
            password = md5.update(password).digest("hex");
            mysql.query(`select count(1) cnt from manager where username='${username}' and password='${password}'`, function (err, data) {
                if (err) {
                    console.log(err);
                    res.send("<script>alert('用户名密码错误！');window.history.go(-1);</script>");
                }
                else {
                    if (data) {
                        req.session.YzmMessageIsAdmin = true;
                        req.session.YzmMessageUsername = username;
                        res.send("<script>alert('登陆成功');window.location.href='/admin';</script>");
                    }
                    else { res.send("<script>alert('用户名密码错误！');window.history.go(-1);</script>"); }
                }
            });
        } else { res.send("<script>alert('用户名密码错误！');window.history.go(-1);</script>"); }
    }
    else { res.send("<script>alert('用户名密码错误！');window.history.go(-1);</script>"); }
});

router.get("/logout",function(req,res,next){
    req.session.YzmMessageIsAdmin = false;
    req.session.YzmMessageUsername = "";
    res.send("<script>window.location.href='/admin/login';</script>");
});

router.get("/homepage",function(req,res,next){
    console.log(req.url);
    res.send("<script>window.location.href='/';</script>");
    
});

router.get('/', function (req, res, next) {
    //res.send("管理员管理");
    res.render("admin/index");
});

router.get('/welcome', function (req, res, next) {
    //res.send("管理员管理");
    res.render("admin/welcome.html");
});

//管理员管理
let managerRouter = require("./admin/manager");
router.use("/manager", managerRouter);
//会员管理
let userRouter = require("./admin/user");
router.use("/user", userRouter);
//栏目管理
let columnRouter = require("./admin/columnist");
router.use("/columnist", columnRouter);
//轮播图管理
let sliderRouter = require("./admin/slider");
router.use("/slider", sliderRouter);
//新闻分类管理
let newstypeRouter = require("./admin/newstype");
router.use("/newstype", newstypeRouter);
//新闻管理
let newsRouter = require("./admin/news");
router.use("/news", newsRouter);
//系统设置
let sysRouter = require("./admin/sys");
router.use("/sys", sysRouter);

//评论设置
let commentRouter = require("./admin/comment");
router.use("/comment", commentRouter);



/*************************************************************************************** */
module.exports = router;