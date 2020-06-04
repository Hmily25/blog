let express = require("express");
let app = express();
let path = require("path");
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false, //扩展模式
    limit: 2 * 1024 * 1024 //限制-2M
}));
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


//捕捉错误
function errorHandler(err, req, res, next) {
    console.error(err.stack);
}
app.use(errorHandler);

const session=require("express-session");
app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:true
}));

let ejs = require("ejs");
app.set("views", './views');
//定义模板引擎
app.engine("html", ejs.__express);
//注册模板引擎 第一个参数固定不变，第二个参数已定义的模板引擎有关
app.set("view engine", "html");
//注册静态资源
app.use("/public", express.static(__dirname + "/public"));
app.use("/upload", express.static(__dirname + "/upload"));
app.use("/images", express.static(__dirname + "/images"));

var ueditor = require("ueditor");
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.use("/public/baidu/ueditors", ueditor(path.join(__dirname, ''), function (req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/images/ueditor/';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/images/ueditor/';
        res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/public/baidu/php/config.json');
    }
}));

//导入前后台路由文件*******************************************************************
let indexRouter = require("./routers/index");
app.use('/', indexRouter);
let adminRouter = require("./routers/admin");
app.use('/admin', adminRouter);
//************************************************************************************
/* app.get("/", function (req, res, next) {
    //输入文字到页面
    //res.send("我是博客首页！");
    res.render("home/index");
}); */

app.listen(3000, function () {
    console.log("node 服务已启动，端口3000");
});