const path = require("path");
const fs = require("fs");
function uploader(imgUri, type = "") {
    let img = "";
    if (imgUri) {
        img = "" + new Date().getTime() + Math.round(Math.random() * 10000) + path.extname(imgUri.originalname);
        img = "/upload/"+type+"/" + img;
        var imgData = fs.readFileSync(imgUri.path);
        fs.writeFileSync(__dirname + "/../" + img, imgData);
        fs.unlinkSync(imgUri.path);
    }
    return img;
}

module.exports = uploader;

