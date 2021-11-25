/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

const COPY = `/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

`;

function getFiles (dirPath, callback) {

    fs.readdir(dirPath, function (err, files) {
        if (err) return callback(err);

        var filePaths = [];
        async.eachSeries(files, function (fileName, eachCallback) {
            var filePath = path.join(dirPath, fileName);

            fs.stat(filePath, function (err, stat) {
                if (err) return eachCallback(err);

                if (stat.isDirectory()) {
                    getFiles(filePath, function (err, subDirFiles) {
                        if (err) return eachCallback(err);

                        filePaths = filePaths.concat(subDirFiles);
                        eachCallback(null);
                    });

                } else {
                    if (stat.isFile() && /\.js$/.test(filePath)) {
                        filePaths.push(filePath);
                    }

                    eachCallback(null);
                }
            });
        }, function (err) {
            callback(err, filePaths);
        });

    });
}

function checkForCopy(content) {
    if (content.indexOf("Copyright") >= 0) {
        return true;
    }

    return false;
}

async function checkFiles(files) {
    const noCopyFiles = [];

    _.forEach(files, (path) => {
        const content = fs.readFileSync(path);

        if (!checkForCopy(content)) {
            noCopyFiles.push(path);
            const data = COPY + content;

            fs.writeFileSync(path, data);
        }
    });

    console.log('files withoud copy:');
    console.log(noCopyFiles);
}

getFiles('./src', function (err, files) {
    if (files && _.size(files) > 0) {
        checkFiles(files);
    }
});