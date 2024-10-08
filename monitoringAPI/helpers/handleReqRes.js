//IMPORTING DEPENEDENCIES
const url = require('url');
const routes = require('../routes/routes.js');
const {StringDecoder} = require('string_decoder');//IMPORTING CLASS
const {notFoundHandler} = require('../handlers/routesHandlers/notFoundHandler.js');
const {jsonParse} = require('./utilities.js');

const handler = {};

handler.handleReqRes = (req, res) => {
    //FOR GET REQUEST 
    const parsedUrl = url.parse(req.url, true); //TRUE BECAUSE INCLUDE QUERY 
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g , ""); 
    const method = req.method.toLowerCase();
    const query = parsedUrl.query;
    const headerObject = req.headers;

    //FOR POST REQUEST
    const decoder = new StringDecoder('utf-8'); //CREATING INSTANCE FOR UTF8 CONVERTING
    
    //GATHERTING REQUESTED PROPERTIES NOT RES
    const requestedProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        query,
        headerObject
    }

    //ROUTING
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    let data ="";
    req.on('data', (buffer)=>{
        data += decoder.write(buffer);// CONVERT BUFFER AND START WRITTING  
    })

    req.on('end', ()=>{
        data += decoder.end(); //CLOSING THE DECODER AFTER WRITTING FINISHED 
        // console.log(data);

        //FOR POST REQUEST WE nEED TO SEND THE INCOMING DATA TO THE HANDLER
        //WE NEED TO CONVERT IT AS JSON OBJECT AND INCLUDE IN REQUESTED PROPERTIES SO THAT HANDLER CAN GET IT
        requestedProperties.body = jsonParse(data);

        //SENDING REQ PROPERTOES IF NEED AND ALSO WAITING FOR GETTING STATUS CODE AND RESPONSE
        chosenHandler(requestedProperties, (statusCode, payLoad) =>{
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payLoad = typeof(payLoad) === 'object' ? payLoad : {};

            //STRINGYFY PAYLOAD
            const payloadString = JSON.stringify(payLoad); 

            //WRITING STATUS CODE AND SENDING HEADER IS NECESSARY
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

        });        
    })    
}

module.exports = handler;