//IMPORTING DEPENDENCIES
const server = require("./lib/server.js");
const worker = require("./lib/worker.js");

// MODULE SCAFFOLDING
const app = {};

app.init = () => {
  //STRAT THE SERVER
  server.init();

  //START THE WORKER
  worker.init();
};
app.init();
