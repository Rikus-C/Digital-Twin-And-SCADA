const fs            	= require("fs");
const pythonReceiver   	= require("./python_websocket_receiver.js");
const pythonSender   	= require("./python_websocket_sender.js");
const webSocketSender   = require("./websocket_sender.js");
const netClient         = require("./net_client.js");
const message           = require("../../settings/modbus_messages.json");
const modbus            = require("./modbus.js");
const dtEditor          = require("./digital_twin_editor.js");
const scadaEditor       = require("./scada_editor.js");
const logger            = require("./logger.js");
const settings          = require("../../settings/comms_settings.json");
const deffies 			= require("../../settings/default.json");
const {ipcRenderer}		= require('electron');
const trendViewer       = require("./run_trend_viewer.js");
  
var api 				= {};

let mainLoopRunning;
let mainLoopErrorChecker;

var dataTagsLogs    	= [];
var errorTagsLogs   	= [];

var rawDataTags	    	= require("../../settings/" + deffies.Model + "-Data.json");
var rawErrorTags    	= require("../../settings/" + deffies.Model + "-Errors.json");

logger.InitiateFiles("data");
logger.InitiateFiles("error");

netClient.ConnectToPLC();

/*Format the data tags into a more useable state*/
for (var key in rawDataTags)
{
	dataTagsLogs.push(rawDataTags[key]);
}

/*Format the error tags into a more useable state*/
for (var key in rawErrorTags)
{
	errorTagsLogs.push(rawErrorTags[key]);
}

/*Check if main loop is still running, if not, restart it*/
CheckForMainLoopError = () =>
{
    mainLoopErrorChecker = setTimeout(() =>
    {
        api.RunMainLoop();
    }, settings.plcPingRate + 10);
}

/*send message to PLC that request all the needed data*/
api.RunMainLoop = () =>
{
    /*clearing interval*/
    clearTimeout(mainLoopErrorChecker);
    netClient.SendRequest(modbus.Convert(message["Request Data"]));
    mainLoopRunning = false;
    CheckForMainLoopError();
}

/*Extract data from frame then format it so that it can be used and send it to the frontend*/
api.ReadModbusMessage = (rawFrame) =>
{
	var plcData = modbus.Read(rawFrame);

	/*if data was received from PLC*/
	if (plcData != "error")
	{
		/*if the right amount of data was receievd from PLC*/
		if (plcData[1] === 1)
		{
			if (plcData[0].length === dataTagsLogs.length)
			{
				Object.keys(rawDataTags).forEach((member, index) => 
				{
					dataTagsLogs[index].value = plcData[0][index]/50;
					rawDataTags[member].value = plcData[0][index]/50;
				});

				/*send tag data with values to frontend*/
				webSocketSender.Send({"type": "PLC Data Push", "spec": "", "data": rawDataTags});

				/*log the new PLC data*/
				logger.LogData(dataTagsLogs);

				/*request error and warning data*/
				netClient.SendRequest(modbus.Convert(message["Request Errors"]));
			}
			else
			{
				console.log("Number of data tags not equal to defined data tags")
			}
		}

		/*if the right amount of error data was receievd from PLC*/
		else if (plcData[1] === 2)
		{
			if (plcData[0].length === errorTagsLogs.length)
			{
				Object.keys(rawErrorTags).forEach((member, index) => 
				{
					errorTagsLogs[index].value = plcData[0][index]/50;
					rawErrorTags[member].value = plcData[0][index]/50;
				});

				/*send tag data with values to frontend*/
				webSocketSender.Send({"type": "PLC Error Push", "spec": "", "data": rawErrorTags});

				/*log the new PLC errors*/
				logger.LogErrors(errorTagsLogs);

				/*restart main loop again*/
				setTimeout(()=>{api.RunMainLoop()}, settings.plcPingRate);
			}
			else
			{
				console.log("Number of error tags not equal to defined data tags")
			}
		}
	}	
}

/*Message from frontend of digital twin*/
api.ReadFrontendMessage = (msg) =>
{
    /**/
    if (msg.type === "Load Model Request") 
    {
        dtEditor.LoadModelrequest(msg);
    }
    /**/
    else if (msg.type === "Update Model Request") 
    {
        dtEditor.UpdateModelRequest(msg);
    }
    /**/
    else if (msg.type === "Part List Request") 
    {
        dtEditor.PartListRequest(msg);
    }
    /**/
    else if (msg.type === "Create Model Request") 
    {
        dtEditor.CreateModelRequest(msg);
    }
    /**/
    else if (msg.type === "Model List Request") 
    {
        dtEditor.ModelListRequest(msg);
    }
    /**/
    else if (msg.type === "Delete Model Request") 
    {
        dtEditor.DeleteModelRequest(msg);
    }
    /**/
    else if (msg.type === "Load Model Info Request") 
    {
        dtEditor.LoadModelInfoRequest(msg);
    }
    /**/
    else if (msg.type === "Load Default Request")
    {
        dtEditor.LoadDefaultRequest();
    }
	/**/
    else if (msg.type === "Replay List Request")
    {
        dtEditor.ReplayListRequest(msg);
    }
	/**/
    else if (msg.type === "Replay Data Request")
    {
        dtEditor.ReplayDataRequest(msg);
    }
    /**/
    else if (msg.type === "Color List Request")
    {
        dtEditor.ColorListRequest();
    }
    /**/
    else if (msg.type === "Load New Scada View")
    {
        scadaEditor.ReturnLayout(msg);
    }
    /**/
    else if (msg.type === "Save Current View")
    {
        scadaEditor.SaveCurrentView(msg);
    }
    /**/
    else if (msg.type === "Send Depth") 
    {
        pythonSender.SendData(msg);
    }
    else if (msg.type === "Get Menu Settings") {
        // Send back json object of page layout names
        scadaEditor.SendBackLayoutFileNamesAndOrder();
    }
    else if (msg.type === "Image Data") 
    {
		  if (msg.data === "Start")
		  {
			  StartDetect();
		  }
		  else
		  {
			  pythonSender.CaseData(msg);
		  }
    }
	else if(msg.type === "show trends")
	{
		trendViewer.Launch(); 
	}
}

function GetRandomNumber(){
    // Generate a random number between 0 and 2
    var randomNumber = Math.random() * 2;
    // Shift the random number to be between -1 and 1
    return randomNumber -= 1;
}

/*Sends the default data and error tags periodically*/
function dummyPLC() 
{
    try{ 
        rawDataTags["Thrust Cylinder Tons Top Right"]["value"] += GetRandomNumber();
        if (rawDataTags["Thrust Cylinder Tons Top Right"]["value"] <= 0.1) rawDataTags["Thrust Cylinder Tons Top Right"]["value"] += 5;
        rawDataTags["Thrust Cylinder Tons Top Left"]["value"] += GetRandomNumber();
        if (rawDataTags["Thrust Cylinder Tons Top Left"]["value"] <= 0) rawDataTags["Thrust Cylinder Tons Top Left"]["value"] += 5;
        rawDataTags["Thrust Cylinder Tons Bottom Right"]["value"] += GetRandomNumber();
        if (rawDataTags["Thrust Cylinder Tons Bottom Right"]["value"] <= 0) rawDataTags["Thrust Cylinder Tons Bottom Right"]["value"] += 5;
        rawDataTags["Thrust Cylinder Tons Bottom Left"]["value"] += GetRandomNumber();
        if (rawDataTags["Thrust Cylinder Tons Bottom Left"]["value"] <= 0) rawDataTags["Thrust Cylinder Tons Bottom Left"]["value"] += 5; 
    } catch (err){
        throw err;
    } 
    
    webSocketSender.Send({"type": "PLC Data Push", 	"spec": "", "data": rawDataTags});
	webSocketSender.Send({"type": "PLC Error Push", "spec": "", "data": rawErrorTags});
}

var dummyTime = setInterval(dummyPLC, 500);

module.exports = api;
