let express = require("express");
let router = new express.Router();
let mysql = require("../../utils/db");
let pager = require("../../utils/pager");
let sysinfo = require("../../utils/sysconf");
let moment = require("moment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({
    dest: "tmp/"
});

let uploader = require("../../utils/uploader");
router.get('/', function (req, res, next) {
    let size = sysinfo.pageSize;
    let pIn = req.query.p >= 1 ? req.query.p : 1;
    let search = req.query.search ? req.query.search : "";
    console.log(1);
    mysql.query("select count(1) total from news where title like ? order by id desc", [`%${search}%`], function (err, data) {
        if (err) {
            res.send("");
            console.log(err);
        } else {
            console.log(data);
            let pages = pager.paging(data[0].total, pIn, size, search);

            mysql.query("select a.id,b.name as cname,a.title,a.img,a.num,a.info,a.author,a.text,a.time,a.keywords,a.description from news a left join newstype b on a.cid=b.id where a.title like ? order by a.id desc limit ?,?", [`%${search}%`, pages.start, pages.size], function (err, data) {
                if (err) {
                    res.send("");
                } else {
                    console.log(search);
                    data.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });

                    res.render("./admin/news/list.html", {
                        data: data,
                        search: search,
                        pages: pages
                    });
                }
            });
        }
    });

});

//新闻分类管理
router.get('/add', function (req, res, next) {
    mysql.query("select id,name from newstype order by id desc", [], function (err, data) {
        if (err) {
            res.send("");
            console.log(err);
        } else {
            res.render("./admin/news/add.html", {
                newstype: data
            });
        }
    });

});

router.post('/add', upload.single("img"), function (req, res, next) {
    console.log(req.body);
    let {
        title,
        cid,
        author,
        text,
        info,
        keywords,
        description
    } = req.body;
    let imgUri = req.file;

    let flag = true;
    flag = flag && title;

    if (!flag) {
        res.send("<script>alert('保存失败0！');window.history.go(-1);</script>");
        return;
    }

    let time = Math.round(new Date().getTime() / 1000);
    //判断标题是否存在
    mysql.query(`select count(1) cnt from news where title='${title}'`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            if (data[0].cnt == 0) {
                //保存图片
                let img = "";
                if (imgUri) {
                    img = uploader(imgUri, "news");
                }
                let num = 0;
                mysql.query("insert into news(cid,title,img,num,info,author,text,time,keywords,description) values(?,?,?,?,?,?,?,?,?,?)", [cid, title, img, num, info, author, text, time, keywords, description], function (err, data) {
                    if (err) {
                        console.log(err);
                        res.send("<script>alert('保存失败1！');window.history.go(-1);</script>");
                    } else {
                        if (data.affectedRows == 1) {
                            res.send("<script>alert('保存成功！');window.location.href='/admin/news/';</script>");
                        } else {
                            res.send("<script>alert('保存失败2！');window.history.go(-1);</script>");
                        }
                    }
                });
            } else {
                res.send("<script>alert('标题已存在，请检查！');window.history.go(-1);</script>");
            }
        }
    });
});

router.get("/ajax_del", function (req, res, next) {
    let id = req.query.id;
    let img = req.query.img;
    mysql.query(`delete from news where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {

            if (fs.existsSync(__dirname + "/../../" + img))
                fs.unlinkSync(__dirname + "/../../" + img);
                console.log(data);
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });
});

router.get("/edit", function (req, res, next) {
    let id = req.query.id;
    mysql.query("select id,name from newstype order by id desc", [], function (err, newstype) {
        if (err) {
            res.send("");
            console.log(err);
        } else {
            mysql.query(`select id,cid,title,img,num,info,author,text,time,keywords,description from news where id=${id}`, [], function (err, data) {
                if (err) {
                    res.send("");
                } else {
                    res.render("./admin/news/edit.html", {
                        data: data[0],
                        newstype: newstype
                    });
                }
            });

        }
    });

});
router.post("/edit", upload.single("img"), function (req, res, next) {
    let {
        title,
        cid,
        author,
        text,
        info,
        keywords,
        description, oldImg,
        id
    } = req.body;
    let imgUri = req.file;

    let flag = true;
    flag = flag && title;
    try {
        //保存图片
        let img = oldImg;
        if (imgUri) {
            img = uploader(imgUri, "news");
            if (fs.existsSync(__dirname + "/../../" + oldImg))
                fs.unlinkSync(__dirname + "/../../" + oldImg);
        }
        let updateSql = "";
        if (img)
            updateSql = `update news set cid='${cid}',title='${title}',img='${img}',info='${info}',author='${author}',text='${text}',keywords='${keywords}',description='${description}' where id=${id};`;
        else
            updateSql = `update news set cid='${cid}',title='${title}',info='${info}',author='${author}',text='${text}',keywords='${keywords}',description='${description}' where id=${id};`;
        mysql.query(updateSql, [], function (err, data) {
            if (err) {
                console.log(err);
                res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
            } else {
                if (data.affectedRows == 1) {
                    res.send("<script>alert('保存成功！');window.location.href='/admin/news/';</script>");
                } else {
                    res.send("<script>alert('保存失败2！');window.history.go(-1);</script>");
                }
            }
        });
    }
    catch{ res.render("./admin/news/"); }

});

module.exports = router;