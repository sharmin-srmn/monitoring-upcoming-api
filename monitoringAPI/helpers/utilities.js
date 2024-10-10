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

//GENERATE TOKEN
utilities.generateToken = (strLength) =>{
    //TOKEN SHOULD BE EQUAL TO PROVIDED LENGTH
    const length = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    //IF LENGTH IS A NUMBER THEN CREATE TOKEN OTHER WISE RETURN FALSE
    if(length){
        const acceptedCharacter = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomToken = "";
        for(let i = 1; i <= length; i++ ){
            let randomCharcter = acceptedCharacter.charAt(Math.floor(Math.random() * acceptedCharacter.length));
            randomToken += randomCharcter;        
        }
        return randomToken;
    }else{
        return false;
    }    
    // const randomToken = 'kusdfhiuwshiuh';        
}


module.exports = utilities; 