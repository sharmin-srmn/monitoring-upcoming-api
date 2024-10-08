//IMPORT DEPENEDENCUES
const crypto = require ('crypto');
const env = require('./environments.js');

//MODULE SCAFFOLDING
const utilities = {};

//STRING TO JSON OBJECT
utilities.jsonParse = (stringData) =>{
    let jsonObjData ;
    try{
        jsonObjData = JSON.parse(stringData);
    }
    catch(error){
        jsonObjData = {};
    }
    return jsonObjData;
}

//FUNCTION FOR HASHING PASSWORD
utilities.hash = (normalPassword) =>{
    //IF PASSWORD VALID THEN HASH IT
    if(typeof(normalPassword) === 'string' && normalPassword.length > 0){
        const hashPassword = crypto.createHmac('sha256', env.secretKey).update(normalPassword).digest('hex');
        return hashPassword;
    }
    return false;   

}


module.exports = utilities; 