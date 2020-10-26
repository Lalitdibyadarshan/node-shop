const path = require('path');
const fs = require('fs');

exports.rootPath =  path.dirname(process.mainModule.filename);

exports.readFromFile = (filePath, cb, defaultValue) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            cb(defaultValue);
        } else {
            cb(JSON.parse(data));
        }
    })
}

exports.writeToFile = (filePath, data, cb) => {
    fs.writeFile(filePath, JSON.stringify(data), cb);
}