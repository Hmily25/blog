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
    mysql.query(`select count(1) total from user where username like ? order by id desc`, [`%${search}%`], function (err, data) {
        if (err) {
            res.send("");
        } else {
            let pages = pager.paging(data[0].total, pIn, size, search);

            mysql.query("select id,username,status,time from user where username like ? order by id desc limit ?,?", [`%${search}%`, pages.start,parseInt(pages.size) ], function (err, data) {
                if (err) {
                    res.send("");
                } else {
                    //console.log(search);
                    data.forEach(item => {
                        item.time = moment(item.time * 1000).format("YYYY-MM-DD HH:mm:ss");
                    });

                    res.render("./admin/user/list.html", {
                        data: data,
                        search: search,
                        pages: pages
                    });
                }
            });

        }
    });

});

module.exports = router;