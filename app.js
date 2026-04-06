var express = require("express");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var createError = require("http-errors");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

var app = express();

<<<<<<< HEAD
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
=======
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
>>>>>>> fcfdbc5 (undone: order & booking)

app.use(logger("dev"));
app.use(express.json()); // Parse Json body
app.use(express.urlencoded({ extended: false })); // Parse form data
app.use(cookieParser()); // Dọc cookie từ request

// Api Routing
app.use("/", require("./routes/index"));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/categories", require("./routes/category.route"));
app.use("/api/menus", require("./routes/menu.route"));
app.use("/api/brandes", require("./routes/brand.route"));
app.use("/api/colors", require("./routes/color.route"));
app.use("/api/booking-time-slots", require("./routes/bookingTimeSlot.route"));
app.use("/api/locations", require("./routes/location.route"));
app.use("/api/banners", require("./routes/banner.route"));
app.use("/api/branches", require("./routes/branch.route"));
app.use("/api/car-series", require("./routes/car-series.route"));
app.use("/api/cars", require("./routes/car.route"));
app.use("/api/bookings", require("./routes/booking.route"));
app.use("/api/cars", require("./routes/specification.route"));
app.use("/api/orders", require("./routes/order.route"));

// Connect Mongo Db
//mongoose.connect("mongodb://mongodb/giencar_api_node?replicaSet=rs0");
//mongoose.connect('mongodb://localhost:27017/giencarnodejs'); // chạy mongo thường
mongoose.connect('mongodb://127.0.0.1:27017/giencarnodejs?replicaSet=rs0');
mongoose.connection.on('connected', function () {
    console.log("connected");
})

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
