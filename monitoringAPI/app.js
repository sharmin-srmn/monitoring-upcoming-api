//IMPORTING DEPENDENCIES
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes.js');
const environments = require('./helpers/environments.js');
const lib = require('./lib/data.js')


// MODULE SCAFFOLDING
const app = {};


//CRETAING DATA
// lib.createData('test', 'mytext', {name: 'sharmin', age : '30'}, (error)=>{
//     console.log(error);
// })

//READING DATA
// lib.readData('test', 'mytext', (result)=>{
//     console.log(result);
// });

//UPDATING DATA
// lib.updateData('test', 'mytext', {name : 'NEW NAME ', age : 32}, (error) =>{
//     console.log(error);
// });

//DELETING DATA
// lib.deleteData('test', 'mytext', (result)=>{
//     console.log(result);
// });

//CREATING SERVER
app.createServer = () =>{
    const server = http.createServer(app.handler);
    server.listen(environments.port , () => {
        console.log(process.env.NODE_ENV);
        console.log(`listening on port http://localhost:${environments.port}`);
    })
}

//CREATING HANDLER FUNCTION FOR SERVER
app.handler = handleReqRes;

//CALLING SERVER CREATING FUNCTION
app.createServer();
