let express = require("express");
let router = new express.Router();
let mysql = require("../../utils/db");
let pager = require("../../utils/pager");
let sysinfo = require("../../utils/sysconf");
let moment = require("moment");
router.get('/', function (req, res, next) {
    let size = sysinfo.pageSize;
    let pIn = req.query.p >= 1 ? req.query.p : 1;
    let search = req.query.search ? req.query.search : "";
    console.log(1);
    mysql.query("select count(1) total from newstype where name like ? order by id desc", [`%${search}%`], function (err, data) {
        if (err) {
            res.send("");
            console.log(err);
        } else {
            console.log(data);
            let pages = pager.paging(data[0].total, pIn, size, search);

            mysql.query("select id,name,sort,keywords,description,time from newstype where name like ? order by id desc limit ?,?", [`%${search}%`, pages.start, pages.size], function (err, data) {
                if (err) {
                    res.send("");
                } else {
                    console.log(search);
                    data.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });

                    res.render("./admin/newstype/list.html", {
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
    //res.send("管理员添加");
    res.render("./admin/newstype/add.html", {
        dmo: {}
    });
});

router.post('/add', function (req, res, next) {
    console.log(req.body);
    let {
        name,
        url,
        keywords,
        sort,
        description
    } = req.body;
    let flag = true;
    flag = flag && name;

    if (!flag) {
        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        return;
    }

    let time = Math.round(new Date().getTime() / 1000);
    //判断名称是否存在
    mysql.query(`select count(1) cnt from newstype where name='${name}'`, [], function (err, data) {
        if (err) {
            console.log(err);
            res.send("");
        } else {
            console.log(data);
            if (data[0].cnt == 0) {
                mysql.query("insert into newstype(name,sort,keywords,description,time) values(?,?,?,?,?)", [name, sort, keywords, description, time], function (err, data) {
                    if (err) {
                        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
                    } else {
                        if (data.affectedRows == 1) {
                            res.send("<script>alert('保存成功！');window.location.href='/admin/newstype/';</script>");
                        } else {
                            res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
                        }
                    }
                });
            } else {
                res.send("<script>alert('名称已存在，请检查！');window.history.go(-1);</script>");
            }
        }
    });
});

router.get("/ajax_del", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`delete from newstype where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });
});

router.get("/edit", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`select id,name,sort,keywords,description,time from newstype where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.render("./admin/newstype/edit.html", {
                data: data[0]
            });
        }
    });
});
router.post("/edit", function (req, res, next) {
    let {
        name,
        sort,
        keywords,
        description,
        id
    } = req.body;
    let updateSql = `update newstype set name='${name}',sort=${sort},keywords='${keywords}',description='${description}' where id=${id};`;

    mysql.query(updateSql, [], function (err, data) {
        if (err) {
            res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        } else {
            res.send("<script>alert('保存成功！');window.history.go(-1);</script>");
        }
    });
});

module.exports = router;