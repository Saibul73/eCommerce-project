const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require('express-session')
const hbs = require("express-handlebars");

var dotenv = require('dotenv');
dotenv.config({ path: './config.env' })

const db = require("./configuration/connection");
const usersRouter = require("./routes/user");
const adminRouter = require("./routes/admin");



const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs.engine({
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
      formatString(date) {
        newdate = date.toUTCString()
        return newdate.slice(0, 16)
      },
      total: function (amount, discount, quantity) {
        return (amount - discount) * quantity;
      },
      singleTotal: function (amount, discount) {
        return (amount - discount);
      }
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req,res,next){
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})

app.use(session({secret:"key",cookie:{maxAge:100000000*5}}))

// db.connect((err) => {
//   if (err) console.log("connection Error" + err);
//   else console.log("Database connected to port 27017");
// });

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("user/error",{layout:false});
});

module.exports = app;
