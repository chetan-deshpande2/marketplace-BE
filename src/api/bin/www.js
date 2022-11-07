/* eslint-disable no-process-exit */
const http = require("http");
const app = require("../app");
const logger = require("../middleware/logger");
// eslint-disable-next-line import/order
const debug = require("debug")("application:server");

/**
 * Normalize a port into a number, string, or false.
 */
const server = http.createServer(app);
// eslint-disable-next-line import/order
// const io = require("socket.io")(server);

function normalizePort(val) {
  const port = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3002");
app.set("port", port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Create HTTP server.
 */

// const io = Server(server, {
// 	cors: {
// 		origin: '*'
// 	}
// })
// io.use(validateSocketToken);
// socketFunc(io);

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
logger.info(`Server has started on ${port}`);
server.on("error", onError);
server.on("listening", onListening);
