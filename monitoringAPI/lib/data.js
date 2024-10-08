const fs = require('fs');
const path = require('path');

const lib = {};

//EXTRACTING BASE FOLDER PATH FOR SENDING DATA
lib.baseDir = path.join(__dirname,'/../.data/');

lib.createData = (dir, fileName, data, callback) =>{
    //FOR CREATING DATA FIRST WE NEED TO OPEN FILE
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'wx',  (error1, fileDescriptor) =>{
        if(!error1 && fileDescriptor){
            //
            const dataString = JSON.stringify(data);
            fs.writeFile(fileDescriptor, dataString, (error2) => {
                if(!error2){
                    fs.close(fileDescriptor, (error3) =>{
                        if(!error3){
                            callback(false);
                        }else{
                            callback('Error Closing file');
                        }
                    });
                }else{
                    callback('Error Writing data');
                }
            });
        }else{
            callback('Error opening file.File may already exists.');
        }
    });
}
lib.readData = (dir, fileName, callback ) =>{
    fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`, 'utf-8', (error, data) =>{
        if(!error){
            callback(error, data);
        }else{
            callback('Error reading File.')
        }
    });
}
lib.updateData = (dir, fileName, data, callback) =>{
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'r+', (error1, fileDescriptor) =>{
        if(!error1 && fileDescriptor){
            const dataString = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (error2)=>{
                if(!error2){
                    fs.writeFile(fileDescriptor, dataString, (error3) =>{
                        if(!error3){
                            fs.close(fileDescriptor, (error4) =>{
                                if(!error4){
                                    callback(false)
                                }else{
                                    callback("Error Closing file.");
                                }
                            });
                        }else{
                            callback("Error Updating file.");
                        }
                    }) 
                }else{
                    callback("Error Truncating file.");
                }
            })
        }else{
            callback("Error opening file.");
        }

    });
}
lib.deleteData = (dir, fileName, callback) =>{
    fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, (error)=>{
        if(!error){
            callback(false);
        }else{
            callback('Error Deleting File');
        }
    });
}

module.exports = lib;