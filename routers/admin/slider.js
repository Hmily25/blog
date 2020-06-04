let express = require("express");
let router = new express.Router();
let mysql = require("../../utils/db");
let moment = require("moment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({
    dest: "tmp/"
});

let uploader = require("../../utils/uploader");

router.get('/', function (req, res, next) {


    let search = req.query.search ? req.query.search : "";
    mysql.query("select id,name,url,sort,img,time from slider where name like ? order by id desc", [`%${search}%`], function (err, data) {
        if (err) {
            res.send("");
        } else {
            console.log(search);
            data.forEach(item => {
                item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
            });

            res.render("./admin/slider/list.html", {
                data: data,
                search: search,
            });
        }
    });

});

//管理员管理
router.get('/add', function (req, res, next) {
    //res.send("管理员添加");
    res.render("./admin/slider/add.html", {
        dmo: {}
    });
});

router.post('/add', upload.single("img"), function (req, res, next) {
    console.log(req.body);
    let {
        name,
        url,
        sort
    } = req.body;
    let imgUri = req.file;
    console.log(imgUri);
    let flag = true;
    flag = flag && name;

    if (!flag) {
        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        return;
    }

    let time = Math.round(new Date().getTime() / 1000);
    //判断名称是否存在
    mysql.query(`select count(1) cnt from slider where name='${name}'`, [], function (err, data) {
        if (err) {
            console.log(err);
            res.send("");
        } else {
            console.log(data);
            if (data[0].cnt == 0) {
                //保存圖片
                let img = "";
                if (imgUri)
                    img = uploader(imgUri, "slider");

                mysql.query("insert into slider(name,url,sort,img,time) values(?,?,?,?,?)", [name, url, sort, img, time], function (err, data) {
                    if (err) {
                        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
                    } else {
                        if (data.affectedRows == 1) {
                            //保存图片
                            res.send("<script>alert('保存成功！');window.location.href='/admin/slider/';</script>");
                        } else {
                            res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
                        }
                    }
                });
            } else {
                res.send("<script>alert('用户名已存在，请检查！');window.history.go(-1);</script>");
            }
        }
    });
});

router.get("/ajax_del", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`delete from slider where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            let img = req.query.img;
            if (fs.existsSync(__dirname + "/../../" + img))
                fs.unlinkSync(__dirname + "/../../" + img);
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });
});

router.get("/edit", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`select id,name,url,sort,img,time from slider where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.render("./admin/slider/edit.html", {
                data: data[0]
            });
        }
    });
});
router.post("/edit", upload.single("img"), function (req, res, next) {
    let {
        name,
        url,
        sort,
        id,
        oldImg
    } = req.body;
    let imgUri = req.file;
    let img = oldImg;
    if (imgUri) {
        img = uploader(imgUri, "slider");
        if (fs.existsSync(__dirname + "/../../" + oldImg))
            fs.unlinkSync(__dirname + "/../../" + oldImg);
    }


    let updateSql = "";
    if (img)
        updateSql = `update slider set name='${name}',sort=${sort},url='${url}',img='${img}' where id=${id};`;
    else
        updateSql = `update slider set name='${name}',sort=${sort},url='${url}' where id=${id};`;
    console.log(updateSql);
    mysql.query(updateSql, [], function (err, data) {
        if (err) {
            res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        } else {
            res.send("<script>alert('保存成功！');window.history.go(-1);</script>");
        }
    });
});

module.exports = router;