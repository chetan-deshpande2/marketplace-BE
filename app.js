import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import 'regenerator-runtime';
import indexRouter from './components/index.js';
import path from 'path';
import session from 'express-session';

const app = express();
app.use(cors({ credentials: true, origin: true }));

app.use(logger('dev'));
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', indexRouter);

export default app;
