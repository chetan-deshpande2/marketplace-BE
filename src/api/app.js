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

const app = express();
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

app.use("/api/v1", indexRouter);

module.exports = app;
