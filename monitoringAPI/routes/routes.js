//IMPORT DEPENDENCIES
const {sampleHandler} = require('../handlers/routesHandlers/sampleHandler.js');
const {userHandler} = require('../handlers/routesHandlers/userHandler.js');


const routes = {
    sample : sampleHandler,
    user : userHandler
};

module.exports = routes;

