let express = require("express");
let router = new express.Router();
let mysql = require("../../utils/db");
let pager = require("../../utils/pager");
let sysinfo = require("../../utils/sysconf");
let moment = require("moment");
const crypto = require("crypto");
router.get('/', function (req, res, next) {
    //res.send("管理员管理");
    let size = sysinfo.pageSize;
    let pIn = req.query.p >= 1 ? req.query.p : 1;
    let search = req.query.search ? req.query.search : "";
    mysql.query(`select count(1) total from manager where username like ? order by id desc`, [`%${search}%`], function (err, data) {
        if (err) {
            res.send("");
        } else {
            let pages = pager.paging(data[0].total, pIn, size, search);

            mysql.query(`select id,username,status,time from manager where 1=1 and username like ? order by id desc limit ?,?`,[`%${search}%`, pages.start,parseInt(pages.size) ], function (err, data) {
                if (err) {
                    console.log(err);
                    res.send("");
                } else {
                    console.log(search);
                    data.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });

                    res.render("./admin/manager/list.html", {
                        data: data,
                        search: search,
                        pages: pages
                    });
                }
            });

        }
    });

});

//管理员管理
router.get('/add', function (req, res, next) {
    //res.send("管理员添加");
    res.render("./admin/manager/add.html", {
        dmo: {}
    });
});

router.post('/add', function (req, res, next) {
    console.log(req.body);
    let {
        name,
        status,
        pass,
        repass
    } = req.body;
    let flag = true;
    flag = flag && name;
    flag = flag && (pass && (pass == repass));

    if (!flag) {
        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        return;
    }

    let md5 = crypto.createHash("md5");
    let newPas = md5.update(pass).digest("hex");
    let time = Math.round(new Date().getTime() / 1000);
    //判断用户名是否存在
    mysql.query(`select count(1) cnt from manager where username='${name}'`, [], function (err, data) {
        if (err) {
            console.log(err);
            res.send("");
        } else {
            console.log(data);
            if (data[0].cnt == 0) {
                mysql.query("insert into manager(username,password,status,time) values(?,?,?,?)", [name, newPas, status, time], function (err, data) {
                    if (err) {
                        res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
                    } else {
                        if (data.affectedRows == 1) {
                            res.send("<script>alert('保存成功！');window.location.href='/admin/manager/';</script>");
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

router.get("/ajax_status", function (req, res, next) {
    let {
        id,
        sta
    } = req.query;

    mysql.query("update manager set status=? where id=?", [sta, id], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });
});

router.get("/ajax_del", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`delete from manager where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });
});

router.get("/edit", function (req, res, next) {
    let id = req.query.id;
    mysql.query(`select id,username,status,password,time from manager where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("");
        } else {
            res.render("./admin/manager/edit.html", {
                data: data[0]
            });
        }
    });
});
router.post("/edit", function (req, res, next) {
    let {
        name,
        pass,
        repass,
        status,
        id
    } = req.body;
    let updateSql = "";
    if (pass && (pass == repass)) {
        let md5 = crypto.createHash("md5");
        let newPas = md5.update(pass).digest("hex");
        updateSql = `update manager set username='${name}',status=${status},password=${newPas} where id=${id};`;
    } else {
        updateSql = `update manager set username='${name}',status=${status} where id=${id};`;
    }

    mysql.query(updateSql, [], function (err, data) {
        if (err) {
            res.send("<script>alert('保存失败！');window.history.go(-1);</script>");
        } else {
            res.send("<script>alert('保存成功！');window.history.go(-1);</script>");
        }
    });
});

module.exports = router;