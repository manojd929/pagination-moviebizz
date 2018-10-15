const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./rest-db/data.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 4010;

server.use(middlewares);
server.use(router);

server.listen(port);
