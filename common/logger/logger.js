/**
 * Created by AsherS on 8/24/15.
 */

var config = require('../Configuration');
var path = require('path');
var mkdirp = require('mkdirp');
var util = require('util');
var hostname = require('../utils/hostname');

var logger = function (file, level, logToConsole) {

    var logFullPath = path.resolve(file);
    logFullPath= logFullPath.replace(/~/g,hostname.homedir());
    mkdirp.sync(path.dirname(logFullPath));

    var log4js = require( "log4js" );
    var appenders = [
        {
            "type": "file",
            "filename": logFullPath,
            "timezoneOffset" : 300 // NYC timezone offset relative to UTC (5 * 60)
        }
    ];

    if (logToConsole)
    {
        appenders.push({
            "type": "console",
            "layout": {
                "type": "pattern",
                pattern: "%d{ABSOLUTE} %[%-5p%] %c %m"
            },
        });
    }

    var log4jsConfiguration = {
        "appenders": appenders,
        "replaceConsole": false,
    };

    log4js.configure(log4jsConfiguration);

    // Support log rotate - this is the signal that is used
    process.on('SIGUSR1', function() {
        log4js.clearAppenders();
        log4js.configure(log4jsConfiguration);
    });

    var res = log4js.getLogger("[PID:"+process.pid+ "]");
    return res;
};


module.exports = function(file, level, logToConsole){
    return logger(file, level, logToConsole);
};