//IMPORTING DEPENDENCiES
const {hash, jsonParse} = require('../../helpers/utilities.js');
const data = require('../../lib/data.js')
const tokenHandler = require('../../handlers/routesHandlers/tokenHandler.js');


const handler = {};
handler.userHandler = (requestedProperties, callback) => {
    //DECLARING ACCETED METHODS
    const acceptedMethods = ['get', 'post', 'patch', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestedProperties.method) > -1){
        //AFTER CONFIRMING MENTHOD, SENDING CORRESPONDING FUNCTION 
        handler._user[requestedProperties.method](requestedProperties, callback);
        
    }else{
        callback(405);// METHOD NOT ALLOWED ON 405
    }    
}

//AFTER CONFIRMING METHOD CREATING PRIVATE OBJECT
handler._user = {};

//POST METHOD FOR PRIVATE
handler._user.post = (requestedProperties, callback) =>{
    //NOW VALIDATE FOR DATA
    //FIRSTNAME VALIDATION
    const firstName = typeof(requestedProperties.body.firstName) === 'string' && requestedProperties.body.firstName.trim().length > 0 ? requestedProperties.body.firstName : false;
    
    //LASTNAME VALIDATION
    const lastName = typeof(requestedProperties.body.lastName) === 'string' && requestedProperties.body.lastName.trim().length > 0 ? requestedProperties.body.lastName : false;
    
    //PHONE VALIDATION
    const phone = typeof(requestedProperties.body.phone) === 'string' && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    //PASSWORD VALIDATION
    const password = typeof(requestedProperties.body.password) === 'string' && requestedProperties.body.password.trim().length > 0  ? requestedProperties.body.password : false;

    //AGREEMENT
    const agreement = typeof(requestedProperties.body.agreement) === 'boolean' && requestedProperties.body.agreement === true  ? requestedProperties.body.agreement : false;
    

    //IF ALL OK THEN
    if(firstName && lastName && phone && password && agreement){
        //NEED TO ENCRYPT PASSWORD
        const encryptedPassword = hash(password);
        //CREATING OBJECT
        const userDetails = {
            firstName,
            lastName,
            phone,
            password : encryptedPassword,
            agreement
        }

        //NOW NEED TO READ FILE 
        data.readData('users', phone, (notFoundError, udata) =>{
            //ERROR  MAANE SAME NAMER FILE TA NAI TAI LIKHA POSSIBLE
            if(notFoundError){
                //AS NOT FOUND SO CREATE A NEW USER
                data.createData('users', phone, userDetails, (writingError)=>{
                    if(!writingError){
                        // TOKEN SHOULD BE GENERATED 
                        // tokenHandler._token.post(requestedProperties, callback);
                        callback(200, {
                            message : 'Successfully created user.'
                        });
                    }else{
                        callback(500, {
                            error : 'Could not create the user. Try again later.'
                        });
                    }
                });
            }else{// MANE SAME PHONE NMUMBER AFILE ACCHE , SO USER ER PROBLM
                callback(400, {
                    message : 'File already Exists, Try another phone number.'
                })
            }
        }); 
    }else{//SOME FILED MIGHT NOT FILLED
        callback(400, {
            error : 'All Fields are Required. Try fill all the fields.'
        });
    }
}  

//GET METHOD FOR PRIVATE
handler._user.get = (requestedProperties, callback) =>{
    const phone = typeof(requestedProperties.query.phone) === 'string' && requestedProperties.query.phone.trim().length === 11 ? requestedProperties.query.phone : false;
    if(phone){
        //BEFORE READING ANY FILE CHECK USER AUTHENTICATION
        const id = typeof(requestedProperties.headerObject.id) === 'string' && requestedProperties.headerObject.id.trim().length === 20 ? requestedProperties.headerObject.id : false ;
        tokenHandler._token.verifyToken(id, phone, (response) =>{
            if(response){
                 //READ THE FILE
                data.readData('users', phone, (error, udata)=>{//AMR READ DATA THEKE ERROR ANAD DATA DUITAI PABO
                    if( !error && udata ){
                        const userdata = { ...jsonParse(udata) };
                        delete userdata.password;
                        callback(200, userdata);
                    }else{
                        callback(404, {
                            error : 'Error reading file. Phone number not found.'
                        });
                    }
                });
            }else{
                callback(403, {
                    error : 'Authentication Failure.'
                });
            }
        });       
    }else{
        callback(400, {
            error : 'There is problem in your request.'
        });
    } 
}  

//PUT METHOD FOR PRIVATE
handler._user.put = (requestedProperties, callback) =>{
    //NOW VALIDATE FOR DATA
    //FIRSTNAME VALIDATION
    const firstName = typeof(requestedProperties.body.firstName) === 'string' && requestedProperties.body.firstName.trim().length > 0 ? requestedProperties.body.firstName : false;
    
    //LASTNAME VALIDATION
    const lastName = typeof(requestedProperties.body.lastName) === 'string' && requestedProperties.body.lastName.trim().length > 0 ? requestedProperties.body.lastName : false;  

    //PHONE VALIDATION
    const password = typeof(requestedProperties.body.password) === 'string' && requestedProperties.body.password.trim().length > 0  ? requestedProperties.body.password : false; 

    //PHONE VALIDATION
    const phone = typeof(requestedProperties.body.phone) === 'string' && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    if(phone){
        if(firstName || lastName || password){
            //BEFORE READING ANY FILE CHECK USER AUTHENTICATION
            const id = typeof(requestedProperties.headerObject.id) === 'string' && requestedProperties.headerObject.id.trim().length === 20 ? requestedProperties.headerObject.id : false ;
            tokenHandler._token.verifyToken(id, phone, (response) =>{
                if(response){
                    //READ THE FILE
                    data.readData('users', phone, (errorReading, udata) =>{
                        if(!errorReading && udata){
                            const userData = {...jsonParse(udata)};
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = hash(password);
                            }
                            data.updateData('users', phone, userData, (errorUpdating ) =>{
                                if(!errorUpdating){
                                    callback(200, {
                                        message : 'Successfully updated file'
                                    });                            
                                }else{
                                    callback(500, {
                                        error : 'Error UPdating file.'
                                    });
                                }
                            })
                        }else{
                            callback(404, {
                                error : 'Error reading file. Phone number not found.'
                            });
                        }
                    });
                }else{
                    callback(403, {
                        error : 'Authentication Failure.'
                    });
                }
            });
        }else{
            callback(400, {
                error : 'PROBELM WITH YOUR REQUEST. you havenot updated anything.'
            });
        }
    }else{
        callback(400, {
            error : 'There is problem in your request.'
        });
    }

}  

//DELETE METHOD FOR PRIVATE
handler._user.delete = (requestedProperties, callback) =>{
    const phone = typeof(requestedProperties.query.phone) === 'string' && requestedProperties.query.phone.trim().length === 11 ? requestedProperties.query.phone : false;
    if(phone){
        //BEFORE READING ANY FILE CHECK USER AUTHENTICATION
        const id = typeof(requestedProperties.headerObject.id) === 'string' && requestedProperties.headerObject.id.trim().length === 20 ? requestedProperties.headerObject.id : false ;
        tokenHandler._token.verifyToken(id, phone, (response) =>{
            if(response){
                data.readData('users', phone, (errorReading, udata)=>{
                    if(!errorReading  && udata){
                        data.deleteData('users', phone, (error) =>{
                            if(!error){
                                callback(200, {
                                    message : 'Successfully deleted user.'
                                });
                            }else{
                                callback(500, {
                                    error : 'There is Problem in server. Error deleting user.'
                                });
                            }                
                        });
                    }else{
                        callback(404, {
                            error : 'Error READING FILE. Phone Number Not Found.'
                        });
                    }
                });
            }else{
                callback(403, {
                    error : 'Authentication Failure.'
                });
            }
        });
    }else{
        callback(400, {
            error : 'There is problem in your request.'
        });
    }


}  


module.exports = handler;