import express, { json, urlencoded } from 'express';
import http from 'http';
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

const server = http.createServer(app);

const port = process.env.PORT || '3000';
app.set('port', port);

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
}

server.listen(port);
console.info(`Server has started on ${port}`);

server.on('listening', onListening);
