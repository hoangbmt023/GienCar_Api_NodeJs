var express = require("express");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var createError = require("http-errors");
const { default: mongoose } = require("mongoose");

var app = express();

app.use(logger("dev"));
app.use(express.json()); // Parse Json body
app.use(express.urlencoded({ extended: false })); // Parse form data
app.use(cookieParser()); // Dọc cookie từ request

// Api Routing
app.use("/", require("./routes/index"));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/auth", require("./routes/auth.route"));
// Connect Mongo Db
mongoose.connect("mongodb://mongodb/giencar_api_node?replicaSet=rs0");
mongoose.connection.on("connected", function () {
  console.log("Đã kết nối vối db.");
});

mongoose.connection.on("disconnected", function () {
  console.log("Kết nối vối db thất bại.");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
