var express = require("express");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
var routes = require('./routes')(express,uuidv4);

var app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set('case sensitive routing', true);
app.use(express.static("public"));
app.use("/", routes);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error',{err:err});
});

module.exports = app;
