const handler = {};

handler.notFoundHandler = (requestedProperties, callback) =>{
    callback(404, {
        message : 'REQUESTED URL NOT FOUND'
    });
}

module.exports = handler;