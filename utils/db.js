let msyql=require("mysql");
var connection= msyql.createConnection({
host:'111.231.109.234',
user:'nblog',
password:'82028535',
database:'nblog'
});

module.exports=connection;