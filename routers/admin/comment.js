const express = require("express");
const router = new express.Router();
const mysql = require("../../utils/db");
let pager = require("../../utils/pager");
let sysinfo = require("../../utils/sysconf");
let moment = require("moment");

router.get("/", function (req, res, next) {
    let size = sysinfo.pageSize;
    console.log(size);
    let pIn = req.query.p >= 1 ? req.query.p : 1;
    let search = req.query.search ? req.query.search : "";

    mysql.query("select count(1) total from comment where text like ? order by id desc", [`%${search}%`], function (err, pdata) {
        if (err) {
            res.send("");
            console.log(err);
        } else {
            let pages = pager.paging(pdata[0].total, pIn, size, search);
            mysql.query("select a.id,b.username as cname,c.title,a.text,a.time,a.status from comment a left join user b on a.user_id=b.id left join news c on a.news_id=c.id where a.text like ? order by id desc limit ?,?", [`%${search}%`, pages.start, pages.size], function (err, data) {
                if (err) {
                    res.send("");
                    console.log(err);
                }
                else {
                    data.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });
                    var commentStatus = [{ "id": 0, "name": "未审核" }, { "id": 1, "name": "已审核" }, { "id": 2, "name": "已拒绝" }];
                    res.render("./admin/comment/list.html", { data: data, commentStatus: commentStatus, search: search, pages: pages });
                }
            });
        }
    });

});

router.get("/changeStatus", function (req, res, next) {
    let { id, val } = req.query;
    console.log(val, id);
    mysql.query(`update comment set status=${val} where id=${id}`, [], function (err, data) {
        if (err) {
            res.send("0");
        } else {
            res.send(data.affectedRows == 1 ? "1" : "0");
        }
    });

});

module.exports = router;