const fs = require('fs');
const path = require('path');

const lib = {};

//EXTRACTING BASE FOLDER PATH FOR SENDING DATA
lib.baseDir = path.join(__dirname,'/../.data/');

lib.createData = (dir, fileName, data, callback) =>{
    //FOR CREATING DATA FIRST WE NEED TO OPEN FILE
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'wx',  (errorOpening, fileDescriptor) =>{
        if(!errorOpening && fileDescriptor){
            //
            const dataString = JSON.stringify(data);
            fs.writeFile(fileDescriptor, dataString, (errorWriting) => {
                if(!errorWriting){
                    fs.close(fileDescriptor, (errorClosing) =>{
                        if(!errorClosing){
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
            callback('Error opening file.File may already exists.Cant register with same number.');
        }
    });
}
lib.readData = (dir, fileName, callback ) =>{
    fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`, 'utf-8', (errorReading, data) =>{
        if(!errorReading){
            callback(errorReading, data);
        }else{
            callback('Error reading File.')
        }
    });
}
lib.updateData = (dir, fileName, data, callback) =>{
    fs.open(`${lib.baseDir}${dir}/${fileName}.json`, 'r+', (errorOpening, fileDescriptor) =>{
        if(!errorOpening && fileDescriptor){
            const dataString = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (errorTruncating)=>{
                if(!errorTruncating){
                    fs.writeFile(fileDescriptor, dataString, (errorWriting) =>{
                        if(!errorWriting){
                            fs.close(fileDescriptor, (errorClosing) =>{
                                if(!errorClosing){
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
    fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, (errorDeleting)=>{
        if(!errorDeleting){
            callback(false);
        }else{
            callback('Error Deleting File');
        }
    });
}

module.exports = lib;