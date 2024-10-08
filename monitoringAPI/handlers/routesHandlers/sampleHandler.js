const handler = {};

handler.sampleHandler = (requestedProperties, callback) =>{
    callback(200, {
        message : 'THIS IS MY SAMPLE HOME PAGE'
    });
    
}

module.exports = handler;