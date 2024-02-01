const fs            	= require("fs");
const dateTime     	 	= require("date-and-time");
const csvHeaders   	 	= require('csv-headers');
const deffies 			= require("../../settings/default.json");
const loggerSettings    = require("../../settings/logger.json");

var logger 				= {};

let dataFileWriter;
let errorFileWriter;

var dataTags            = [];
var errorTags           = [];
var dataLoggerReady     = false;
var errorLoggerReady    = false;
var dataFilesLocation   = loggerSettings["Data Location"];
var errorFilesLocation  = loggerSettings["Error Location"];
var backupFilesLocation = loggerSettings["Backup Location"];
	
var rawDataTags	    	= require("../../settings/" + deffies.Model + "-Data.json");
var rawErrorTags    	= require("../../settings/" + deffies.Model + "-Errors.json");

/*format the data tags into a more useable state*/
for (var key in rawDataTags)
{
	dataTags.push(rawDataTags[key]);
}

/*format the error tags into a more useable state*/
for (var key in rawErrorTags)
{
	errorTags.push(rawErrorTags[key]);
}

logger.InitiateFiles = async (type) =>
{   
    let currentTags;
    let currentFileWriter;
    let currentFilesLocation;

    var newFileName         = "";
    var correctHeaders      = "";
    var makeNewFile         = true;
    var dumpOldDataFiles    = false;
    var maxFilesInFolder    = 20;

    /*if it is the first iteration of the loop*/
    if (type === "data")
    {
        currentTags = dataTags;
        currentFilesLocation = dataFilesLocation;
    }
    /*second iteration of the loop*/
    else if (type === "error")
    {
        currentTags = errorTags;
        currentFilesLocation = errorFilesLocation;
    }
    /*if the loop counter failed*/
    else
    {
        console.log("Data logger initialization failed");
    }
    
    /*determine what the correct headers are for data file*/
    currentTags.forEach((sensor) =>
    {
        /*if tag name is not empty*/
        if (sensor.name.length > 0)
        {
            correctHeaders += sensor.name + ",";
        }
    });

    /*add header for date and time of log as well*/
    correctHeaders = "date,time," + correctHeaders.slice(0, -1);

    /*check if data log folder needs to be created*/
    /*if so it will automatically make a new one*/
    fs.mkdirSync(currentFilesLocation, {recursive: true});

    /*get all data log files from data log folder*/
    var files = fs.readdirSync(currentFilesLocation);

    /*if there allready are files in the directory*/
    if (files.length > 0)
    {
        var now                 = new Date();
        var fileOutOfDate       = false;
        var doneReadingHeaders  = false;
        var newestFileInDir     = files[files.length - 1];
        var newestFileHeaders   = "";

        var csv_options = 
        {
            file      : currentFilesLocation + newestFileInDir,
            delimiter : ","
        };

        /*read headers of the newest file in directory*/
        csvHeaders(csv_options, (error, fileHeaders) => 
        {
            /*display if an error accurred*/
            if (error) throw error;

            newestFileHeaders   = fileHeaders.join(",");
            doneReadingHeaders  = true;
        });

        /*wait untill program is finished reading the headers*/
        while (!doneReadingHeaders){await new Promise(r => setTimeout(r, 10));};

        var newestFileDate  = newestFileInDir.split("_")[1];
        var todaysDate      = dateTime.format(now, 'YYYY-MM-DD');

        /*if the newest file's date is not the same as today's date*/
        if (newestFileDate !== todaysDate){fileOutOfDate = true;}

        /*the newest file in directory's headers are valid and file is not out of date*/
        if ((newestFileHeaders === correctHeaders) && (!fileOutOfDate))
        {
            /*a new file does not have to be made*/
            makeNewFile = false;

            /*use the newest file in directory as the logging file*/
            currentFileWriter = fs.createWriteStream(currentFilesLocation + newestFileInDir, {flags: 'a'});
        }
        
        /*if there are more than 50 files in data folder*/
        if (files.length > maxFilesInFolder) {dumpOldDataFiles = true;}
    }
    
    /*if a new file needs to be added to directory*/
    if (makeNewFile)
    {
        /*determine data and time of when new file is created*/
        now = new Date();

        /*generate name for the new file*/
        newFileName = type + "_" + dateTime.format(now, 'YYYY-MM-DD_HH-mm-ss') + ".csv";

        /*create new file using the new name*/
        currentFileWriter = fs.createWriteStream(currentFilesLocation + newFileName, {flags: 'a'});

        /*write correct headers to new file*/
        currentFileWriter.write(correctHeaders);
    }

    /*if data files need to be dumped*/
    if (dumpOldDataFiles)
    {
        /*check if data dump folder needs to be created*/
        /*if so it will automatically make a new one*/
        fs.mkdirSync(backupFilesLocation, {recursive: true});
        
        /*for every file in data directory, except the newest file*/
        for (var index = 0; index < files.length - 1; index++)
        {
            var doneRenaming    = false;
            var file            = files[index]; 
            var oldPath         = currentFilesLocation + file;
            var newPath         = backupFilesLocation + file;

            fs.rename(oldPath, newPath, (err) => 
            {
                if (err) throw err
                doneRenaming = true;
            });
    
            /*wait untill program is finished renaming a file*/
            while (!doneRenaming){await new Promise(r => setTimeout(r, 10));};
        }
    }

    /*if data logging was initiated*/
    if (type === "data")
    {
        dataFileWriter = currentFileWriter;
        dataLoggerReady = true;
    }   
    /*if error logging was initiated*/
    else if (type === "error")
    {
        errorFileWriter = currentFileWriter;
        errorLoggerReady = true;
    }
}

logger.LogData = (plcData) =>
{
    /*if data logger is not ready yet*/
    if (!dataLoggerReady) return;

    var arrData = [];

    /*format incoming data*/
    plcData.forEach((sensor) =>
    {
        /*if sensor exists*/
        if (sensor.name.length > 0)
        {
            /*add value to data array*/
            arrData.push(sensor.value);
        }
    });
    /*finalize formatting of data*/
    var data = arrData.join(",");

    /*determine data and time that data is logged*/
    var now     = new Date();
    var date    = dateTime.format(now, 'YYYY/MM/DD') + ",";
    var time    = dateTime.format(now, 'HH:mm:ss') + ",";  

    /*log the data*/
    dataFileWriter.cork();
    dataFileWriter.write("\n" + date + time + data);
    process.nextTick(() => dataFileWriter.uncork());
}

logger.LogErrors = (plcData) =>
{
    /*if error logger is not ready yet*/
    if (!errorLoggerReady) return;

    var arrData = [];

    /*format incoming data*/
    plcData.forEach((sensor) =>
    {
        /*if sensor exists*/
        if (sensor.name.length > 0)
        {
            /*add value to data array*/
            arrData.push(sensor.value);
        }
    });
    /*finalize formatting of data*/
    var error = arrData.join(",");

    /*determine data and time that data is logged*/
    var now     = new Date();
    var date    = dateTime.format(now, 'YYYY/MM/DD') + ",";
    var time    = dateTime.format(now, 'HH:mm:ss') + ",";

    /*log the error*/
    errorFileWriter.cork();
    errorFileWriter.write("\n" + date + time + error);
    process.nextTick(() => errorFileWriter.uncork());
}

logger.StopLoggingData = () =>
{

}

module.exports = logger;