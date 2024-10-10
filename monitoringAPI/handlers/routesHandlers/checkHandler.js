//IMPORT DEPENDENCIES
const data = require('../../lib/data.js');
const tokenHandler = require ('../../handlers/routesHandlers/tokenHandler.js');
const currentEnv = require('../../helpers/environments.js');
const { jsonParse, generateToken } = require('../../helpers/utilities.js');


const handler = {};

handler.checkHandler = (requestedProperties, callback) =>{
    const acceptedMethods = ['put', 'post', 'get', 'delete'];
    if(acceptedMethods.indexOf(requestedProperties.method) > -1){
        handler._check[requestedProperties.method](requestedProperties, callback);
    }else{
        callback(405);
    }
}

handler._check = {};

handler._check.post = (requestedProperties, callback)=>{
    //CHECK VALIDATION OF ALL INPUT FIELDS
    const protocol = typeof(requestedProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol : false;

    const url = typeof(requestedProperties.body.url) === 'string' && requestedProperties.body.url.trim().length > 0 ? requestedProperties.body.url : false;

    const method = typeof(requestedProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1 ? requestedProperties.body.method : false;

    const timeCount = typeof(requestedProperties.body.timeCount) === 'number' && requestedProperties.body.timeCount % 1 === 0 && requestedProperties.body.timeCount >= 1  && requestedProperties.body.timeCount <= 5 ? requestedProperties.body.timeCount : false;  

    const statusCode = typeof(requestedProperties.body.statusCode) === 'object' && requestedProperties.body.statusCode instanceof Array ? requestedProperties.body.statusCode : false;

    //TOKEN SHOULD BE RECEVIED FROM HEADER
    const tokenID = typeof(requestedProperties.headerObject.token) === 'string' && requestedProperties.headerObject.token.trim().length === 20 ? requestedProperties.headerObject.token : false ;

    //EXTRACT PHONE NUMBER USING TOKEN ID
    data.readData('tokens', tokenID, (errorReadingTokenFile, tokendata ) => {
        if(!errorReadingTokenFile && tokendata){
            const phone = jsonParse(tokendata).phone;
            //SEARCH USER USING PHONE NUMBER
            data.readData('users', phone, (errorReadingUserFile, udata) =>{
                if(!errorReadingUserFile && udata){
                    //NOW VERIFY USER 
                    tokenHandler._token.verifyToken(tokenID, phone, (isTokenValidate) =>{
                        if(isTokenValidate){
                            const userDetails = jsonParse(udata);
                            const checkList = typeof(userDetails.checkList) === 'object' && userDetails.checkList instanceof Array ? userDetails.checkList : [];

                            if(checkList.length < currentEnv.maxLimit){
                                if(protocol && url && method && statusCode && timeCount ){
                                    //GENERATE CHECK ID
                                    const checkID = generateToken(20);
                                    const checkObject = {
                                        checkID,
                                        phone,
                                        method,
                                        protocol,
                                        url,
                                        statusCode,
                                        timeCount
                                    }
                                    data.createData('checks', checkID, checkObject, (errorCreatingCheckfile)=>{
                                        if(!errorCreatingCheckfile){
                                            //UPDTAE USER FILE
                                            userDetails.checkList = checkList;
                                            userDetails.checkList.push(checkID);
                                            //SAVE THE UPDATED USER DETAILS
                                            data.updateData('users', phone, userDetails, (errorUpdatingUserFile) =>{
                                                if(!errorUpdatingUserFile){
                                                    callback(200, {
                                                        message : 'Succesfully created the chcek list.'
                                                    })

                                                }else{
                                                    callback(500, {
                                                        error : 'There is internal problem at server side.' 
                                                    });
                                                }
                                            });
                                        }else{
                                            callback(500, {
                                                error : 'There is internal problem at server side.' 
                                            });
                                        }
                                    });
                                }else{
                                    callback(400, {
                                        error : 'There is problem in your request. all fields are required.' 
                                    });
                                }

                            }else{
                                callback(403, {
                                    error : 'You have alreday reached your max limits.'
                                });
                            }
                        }else{
                            callback(401,{
                                error : 'Authentication Failure.'
                            });
                        }
                    });
                }else{
                    callback(404, {
                        error : 'User not found.'
                    });
                }
            });
        }else{
            callback(404,{
                error : 'Token ID Not found. '
            });
        }
    });
}

handler._check.get = (requestedProperties, callback)=>{
    //CHECK ID SHOULD BE GIVEN AS QUERY STRING
    const checkID = typeof(requestedProperties.query.checkID) === 'string' && requestedProperties.query.checkID.trim().length === 20 ? requestedProperties.query.checkID : false;

    //TOKEN SHOULD BE RECEVIED FROM HEADER
    const tokenID = typeof(requestedProperties.headerObject.token) === 'string' && requestedProperties.headerObject.token.trim().length === 20 ? requestedProperties.headerObject.token : false ;

    //
    data.readData('tokens', tokenID, (errorReadingTokenFile, tokenData) =>{
        if(!errorReadingTokenFile, tokenData){
            //CHECK TOKEN VALIDITY
            tokenHandler._token.verifyToken(tokenID, jsonParse(tokenData).phone, (isTokenValidate) =>{
                if(isTokenValidate){
                    if(checkID){
                        data.readData('checks', checkID, (errorReadingCheckFile, checkData) =>{
                            if(!errorReadingCheckFile && checkData){
                                callback(200, jsonParse(checkData));
                            }else{
                                callback(500, {
                                    error : "There is internal error at server side."
                                });
                            }
                        });
                    }else{
                        callback(404, {
                            error: 'Check ID not Found.'
                        });
                    }
                }else{
                    callback(401, {
                        error: 'Authentication Failure.'
                    });
                }                    
            });
        }else{
            callback(404 , {
                error: 'Token ID NOT FOUND.'
            });
        }
    });       
}

handler._check.put = (requestedProperties, callback)=>{
    //CHECK VALIDATION OF ALL INPUT FIELDS
    const protocol = typeof(requestedProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol : false;

    const url = typeof(requestedProperties.body.url) === 'string' && requestedProperties.body.url.trim().length > 0 ? requestedProperties.body.url : false;

    const method = typeof(requestedProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1 ? requestedProperties.body.method : false;

    const timeCount = typeof(requestedProperties.body.timeCount) === 'number' && requestedProperties.body.timeCount % 1 === 0 && requestedProperties.body.timeCount >= 1  && requestedProperties.body.timeCount <= 5 ? requestedProperties.body.timeCount : false;  

    const statusCode = typeof(requestedProperties.body.statusCode) === 'object' && requestedProperties.body.statusCode instanceof Array ? requestedProperties.body.statusCode : false;

    
    const checkID = typeof(requestedProperties.body.checkid) === 'string' && requestedProperties.body.checkid.trim().length === 20 ? requestedProperties.body.checkid : false;

    //TOKEN SHOULD BE RECEVIED FROM HEADER
    const tokenID = typeof(requestedProperties.headerObject.token) === 'string' && requestedProperties.headerObject.token.trim().length === 20 ? requestedProperties.headerObject.token : false ;

    //
    data.readData('tokens', tokenID, (errorReadingTokenFile, tokenData) =>{
        if(!errorReadingTokenFile, tokenData){
            //CHECK IF USER EXIST OR NOT
            data.readData('users', jsonParse(tokenData).phone, (errorReadingUserFile) =>{
                if(!errorReadingUserFile){
                    //CHECK TOKEN VALIDITY
                    tokenHandler._token.verifyToken(tokenID, jsonParse(tokenData).phone, (isTokenValidate) =>{
                        if(isTokenValidate){
                            if(protocol || url || method || statusCode || timeCount){
                                //
                                data.readData('checks', checkID, (errorReadingCheckFile, checkdata) =>{
                                    if(!errorReadingCheckFile && checkdata){
                                        const checkDetails = jsonParse(checkdata);
                                        if(protocol){
                                            checkDetails.protocol = protocol;
                                        }
                                        if(url){
                                            checkDetails.url = url;
                                        }
                                        if(method){
                                            checkDetails.method = method;
                                        }
                                        if(statusCode){
                                            checkDetails.statusCode = statusCode;
                                        }
                                        if(timeCount){
                                            checkDetails.timeCount = timeCount;
                                        }

                                        //UPDATE THE CHECK FILE
                                        data.updateData('checks', checkID, checkDetails, (errorUpdatingCheckFile) =>{
                                            if(!errorUpdatingCheckFile){
                                                callback(200,{
                                                    message : 'Successfully updated the check details.'
                                                });
                                            }else{
                                                callback(500, {
                                                    error : 'There is internal problem at server side.' 
                                                });
                                            }
                                        });
                                    }else{
                                        callback(404, {
                                            error : 'Check ID not found.' 
                                        });
                                    }
                                });
                            }else{
                                callback(400, {
                                    error : 'There is problem in your request. all fields are required.' 
                                });
                            }
                        }else{
                            callback(401, {
                                error : 'Authorization Failure.'
                            });
                        }
                    });
                }else{
                    callback(404, {
                        error : 'User not found.'
                    });
                }
            });
        }else{
            callback(404, {
                error : 'Token ID not found.'
            });
        }
    });
} 

handler._check.delete = (requestedProperties, callback)=>{
    //CHECK ID VALIDATION
    const checkID = typeof(requestedProperties.query.checkid) === 'string' && requestedProperties.query.checkid.trim().length === 20 ? requestedProperties.query.checkid : false;

    //TOKEN SHOULD BE RECEVIED FROM HEADER
    const tokenID = typeof(requestedProperties.headerObject.token) === 'string' && requestedProperties.headerObject.token.trim().length === 20 ? requestedProperties.headerObject.token : false ;


    //
    data.readData('tokens', tokenID, (errorReadingTokenFile, tokenData) =>{
        if(!errorReadingTokenFile && tokenData){
            const phone = jsonParse(tokenData).phone;
            //FETCH USER DATA
            data.readData('users', phone, (errorReadingUserFile, udata) =>{
                if(!errorReadingUserFile && udata){
                    //VALIDATE TOKEN
                    tokenHandler._token.verifyToken(tokenID, phone, (isTokenValidate) =>{
                        if(isTokenValidate){
                            if(checkID){
                                data.deleteData('checks', checkID, (errorDeletingCheckFile) =>{
                                    if(!errorDeletingCheckFile){
                                        //NOW UPDATE USER FILE AND REMOVE THE CHCEK ID FROM ITS CHECKLIST
                                        const userDetails = jsonParse(udata);
                                        const checkList = typeof(userDetails.checkList) === 'object' && userDetails.checkList instanceof Array ?
                                        userDetails.checkList : [];
                                        checkList.splice(checkList.indexOf(checkID), 1);
                                        console.log(checkList);
                                        console.log(userDetails.checkList);
                                        

                                        data.updateData('users',phone, userDetails, (errorUpdatingUserFile)=>{
                                            if(!errorUpdatingUserFile){
                                                callback(200, {
                                                    message : 'Successfully Deleted the check.'
                                                });
                                            }else{
                                                callback(500, {
                                                    error : 'There is internal issue at server sideooo.'
                                                });
                                            }
                                        } );    
                                    }else{
                                        callback(500, {
                                            error :'There is internal issue at server sideiii.'
                                        });
                                    }
                                });
                            }else{
                                callback(404, {
                                    error : 'Check ID not found.'
                                })
                            }                            
                        }else{
                            callback(401,{
                                error : 'Authentication Failure.'
                            });
                        }
                    });
                }else{
                    callback(404, {
                        error : 'User not found.'
                    });
                }
            });
        }else{
            callback(404, {
                error : 'Token ID not found.'
            });
        }
    });    
}

module.exports = handler;
