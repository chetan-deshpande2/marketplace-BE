import http from 'http';
import app from './app.js';

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
