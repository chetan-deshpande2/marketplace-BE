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
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * self  blob: data: gap://ready; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
  );
  next();
});
app.use(cors({ credentials: true, origin: true }));
app.use(
  cors({
    origin: ["*"],
    credentials: true,
    allowedHeaders: "X-Requested-With, Content-Type, Authorization",
    methods: "GET, POST, PATCH, PUT, POST, DELETE, OPTIONS",
  })
);

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
