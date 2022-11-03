import createError from "http-errors";
import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import "regenerator-runtime";
import indexRouter from "./components";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
const MemoryStore = require("memorystore")(session);
// import cron from 'node-cron'
// import {  approveScheduledNft } from './components/admin/nft-management/nftController'
// import{ marketPlaceSetting} from './components/user/settingsController'
// import { createSuperAdmin } from './components/admin/admin-management/adminController'

// Create SuperAdmin if not exist
// (async () => await createSuperAdmin()) ()

const app = express();
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * self  blob: data: gap://ready; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
  );
  next();
});
app.use(cors({ credentials: true, origin: true }));

app.use(logger("dev"));
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    cookie: { maxAge: 60000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    saveUninitialized: true,
    resave: "true",
    secret: "secret",
  })
);
app.use(flash());
app.use("/api/v1", indexRouter);

//setting up custom error message for routes
// app.use((req, res, next) => {
// 	const error = new Error('This API is under development.')
// 	error.status = 404
// 	next(error)
// })

//cors
// app.all("*", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-type,Accept,X-Access-Token,X-Key"
//   );
//   if (req.method == "OPTIONS") {
//     res.status(200).end();
//   } else {
//     next();
//   }
// });
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
