//IMPORT DEPENDENCIES
const {sampleHandler} = require('../handlers/routesHandlers/sampleHandler.js');
const {userHandler} = require('../handlers/routesHandlers/userHandler.js');
const {tokenHandler} = require('../handlers/routesHandlers/tokenHandler.js');


const routes = {
    sample : sampleHandler,
    user : userHandler,
    token : tokenHandler
};

module.exports = routes;

