let express = require("express");
const router = new express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = multer({
    dest: "tmp/"
});
let uploader = require("../../utils/uploader");
router.get("/", function (req, res, next) {
    var data = fs.readFileSync(__dirname + "/../../utils/sysconf.json", "utf-8");
    //var jsonData = JSON.parse(data);
    console.log(data);
    res.render("./admin/sysconf/sys.html", { data: JSON.parse(data) });
});

router.post("/edit", upload.single("logo"), function (req, res, next) {
    let { version, keywords, title, pageSize, logo, oldImg } = req.body;
    var imgUri = req.file;
    let img = "";
    console.log(logo);
    if (imgUri) {     
        img = "/upload/sys/logo.png";
        var imgData = fs.readFileSync(imgUri.path);
        fs.writeFileSync(__dirname + "/../.." + img, imgData);
        fs.unlinkSync(imgUri.path); 
    }
    var data = { "version": version, "keywords": keywords, "title": title, "pageSize": pageSize, "logo":"/upload/sys/logo.png" };
    console.log("1111",data);
    try {
        fs.writeFileSync(__dirname + "/../../utils/sysconf.json", JSON.stringify(data));
        res.send("<script>alert('保存成功！');window.location.href='/admin/sys/';</script>");
    } catch{ res.send("<script>alert('保存失败！');window.history.go(-1);</script>"); }
});

module.exports = router;
