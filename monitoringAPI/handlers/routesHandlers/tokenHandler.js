//IMPORT DEPENDENCIES
const data = require('../../lib/data.js');
const {hash, jsonParse, generateToken} = require('../../helpers/utilities.js')

const handler = {};

handler.tokenHandler = (requestedProperties, callback) =>{
    //AT FIRST VERIFY REQUEST TYPE
    const acceptedMethods = ['post', 'put', 'get', 'delete', 'patch'];
    if(acceptedMethods.indexOf(requestedProperties.method) > -1){
        handler._token[requestedProperties.method](requestedProperties, callback);
    }else{
        callback(405);
    }    
}

//PRIVATE OBJECT PROPERTY
handler._token = {};

//TOKEN POST - CREATE A NEW TOKEN 
handler._token.post = (requestedProperties, callback) =>{
    //CHECK PHONE AND PASSWORD VALIDITY
    const phone = typeof(requestedProperties.body.phone) === 'string' && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    const password = typeof(requestedProperties.body.password) === 'string' && requestedProperties.body.password.trim().length > 0 ? requestedProperties.body.password : false;
    
    if(phone && password){// PHONE PASSWORD OK , THEN READ THE FILE FIRST
        data.readData('users', phone, (errorReading, udata )=>{
            if(!errorReading && udata){
                //HASHING THE PASSWORD TO MATCH WITH INCOMING USER PASSWORD
                const hashPassword = hash(password);
                if(hashPassword === jsonParse(udata).password){
                    //GENERATE TOKEN
                    const tokenID = generateToken(20); 
                    const expires = Date.now()  + 60 * 60 * 1000 ;//GIVING EXPIRY TIME

                    const tokenObject = {
                        phone,
                        id: tokenID,
                        expires
                    }
                    data.createData('tokens', tokenID, tokenObject, (errorCreating) => {
                        if(!errorCreating){
                            callback(200, {
                                message : 'Successfully created the token.'
                            })
                        }else{
                            callback(500, {
                                error : "There is problem in server. Try again later."
                            });
                        }
                    })
                }else{
                    callback(400,{
                        error : 'Password does not match.'
                    });
                }
            }else{
                callback(404,{
                    error: 'Requested phone number not found.'
                });
            }
        })
    }else{// PHONE PASSWORD NOT  OK , THEN SEND ERROR
        callback(400,{
            error: 'There is a problem in your request.'
        });
    }
}
//GET TOKEN DETAILS
handler._token.get = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.trim().length === 20 ? requestedProperties.query.id : false;
    if(id){
        data.readData('tokens', id, (errorReading, tokendata) =>{
            if(!errorReading && tokendata){
                const tokendetails = {...jsonParse(tokendata)};
                callback(200,tokendetails);
            }else{
                callback(404, {
                    error: 'Requested token Id not found.'
                });
            }
        });
    }else{
        callback(400, {
            error : " There is problem in your request."
        });
    }
    
}

//UPDATE THE TOKEN
handler._token.put = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.body.id) === 'string' && requestedProperties.body.id.trim().length === 20 ? requestedProperties.body.id : false;
    const extend = typeof(requestedProperties.body.extend) === 'boolean' && requestedProperties.body.extend === true ? requestedProperties.body.extend : false;
    if(id && extend){
        data.readData('tokens', id, (errorReading, tokendata )=>{
            if(!errorReading && tokendata){
                const tokenDetails = jsonParse(tokendata);
                //CHECK IF TOKEN ALREADY EXPIRED OR NOT
                if(tokenDetails.expires > Date.now()){
                    tokenDetails.expires = Date.now() + 60 * 60 * 1000;
                    //UPDATE THE EXPIRY TIME
                    data.updateData('tokens', id, tokenDetails, (errorUpdating)=>{
                        if(!errorUpdating){
                            callback(200,{
                                message : 'Succesfully updated The Expiry Time. '
                            });
                        }else{
                            callback(500, {
                                error : 'Error updating Expiry Time.'
                            });
                        }
                    });
                }else{
                    callback(404, {
                        error : 'Token already expires.'
                    });
                }
            }else{
                callback(404, {
                    error : 'Requested token Id not found.'
                });
            }
        });
    }else{
        callback(400, {
            error : 'There is problem in your request'
        });
    }
}

//DELETE TOKEN
handler._token.delete = (requestedProperties, callback) =>{
    const id = typeof(requestedProperties.query.id) === 'string' && requestedProperties.query.id.trim().length === 20 ? requestedProperties.query.id : false;
    if(id){
        data.readData('tokens', id, (errorReading, tokendata) =>{
            if(!errorReading && tokendata ){
                data.deleteData('tokens', id, (errorDeleting)=>{
                    if(!errorDeleting){
                        callback(200, {
                            message : 'Successfully deleted the token.'
                        });
                    }else{
                        callback(500,{
                            error : "There is a problem in Server. Try again later. Error Deleting Token."
                        });
                    }
                });
            }else{
                callback(404, {
                    error : 'Requested token Id does not found.'
                });
            }
        });
    }else{
        callback(400, {
            error : 'There is problem in your request.'
        })
    }
}

//VERIFY USER
handler._token.verifyToken = (id, phone, callback)=>{
    //
    data.readData('tokens', id, (errorReading, tokendata) =>{
        if(!errorReading && tokendata){
            if(jsonParse(tokendata).phone === phone && jsonParse(tokendata).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
}

module.exports = handler;