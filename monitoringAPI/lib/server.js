//IMPORTING DEPENDENCIES
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes.js");
const environments = require("../helpers/environments.js");

// MODULE SCAFFOLDING
const server = {};

//CREATING SERVER
server.createServer = () => {
  const createServerVariable = http.createServer(server.handler);
  createServerVariable.listen(environments.port, () => {
    console.log(`Running in ${process.env.NODE_ENV} mode`);
    console.log(`Listening on port http://localhost:${environments.port}`);
  });
};

//CREATING HANDLER FUNCTION FOR SERVER
server.handler = handleReqRes;

//CALLING SERVER CREATING FUNCTION
server.init = () => {
  server.createServer();
};

module.exports = server;
