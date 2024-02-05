const express 		= require('express');
const electron 		= require('electron');
const scadaApp 		= express();
const dtApp			= express();
const fs 			= require("fs"); 
const deffies 		= require("./backend/settings/default.json");
const path 			= require('path');

// Add deffies for JS applications
var monitorDT		= deffies.ScreenDT - 1;
var monitorSC		= deffies.ScreenSC - 1
var fullDT			= deffies.FullDT;
var fullSC			= deffies.FullSC;

// Add deffies for Ferdi's Control windows
var monitorCS1      = deffies.ScreenCS1 - 1;
var monitorCS2      = deffies.ScreenCS2 - 1;
var monitorCS3      = deffies.ScreenCS3 - 1;
var fullCS1         = deffies.FullCS1;
var fullCS2         = deffies.FullCS2;
var fullCS3         = deffies.FullCS3;

// Screen number, window mode, url
var views_setups = [
    [monitorDT, fullDT, "http://localhost:3004"],
    [monitorSC, fullSC, "http://localhost:3003"],
    [monitorCS1, fullCS1, "https://192.168.1.10:8080/webvisu.htm"],
    [monitorCS2, fullCS2, "https://192.168.1.10:8080/webvisu.htm"],
    [monitorCS3, fullCS3, "https://192.168.1.10:8080/webvisu.htm"]
];

require('./backend/scripts/javascript/net_receiver.js');
require('./backend/scripts/javascript/websocket_receiver.js');

scadaApp.use(express.static('./frontend/scada_app'));
dtApp.use(express.static('./frontend/dt_app'));

scadaApp.listen(3003, function() 
{
	//console.log('\nControl Panel Server Running on Port 3003\n\n');
});

dtApp.listen(3004, function() 
{
	//console.log('\nControl Panel Server Running on Port 3004\n\n');
});

const {app, BrowserWindow, ipcMain} 	= require("electron");
const { spawn } 						= require('child_process');

app.commandLine.appendSwitch('ignore-certificate-errors');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true

let scadaWindow;
let dtWindow;

function createWindow() {
	const displays 			= electron.screen.getAllDisplays();
    views_setups.forEach((current_view) => {
        if (fullSC > -1){
            var thisWindow;
		    var {x,y,width,height} 	= displays[current_view[0]].bounds;
		    var fullScreen 			= false;
		    var windowedScreen 		= false;

		    if (current_view[1] > 0)
		    { 
			    fullScreen = true;

			    if (current_view[1] > 1)
			    {
				    windowedScreen = true;
			    }
		    }

		    thisWindow = new BrowserWindow(
		    {
			    icon:				'frontend/scada_app/images/App_Logo.jpg',
			    width: 				500,
			    height: 			500,
			    autoHideMenuBar: 	windowedScreen,
			    fullscreen: 		fullScreen,
			    x,
			    y,
			    webPreferences: 
			    {
				    nodeIntegration: true,
			    }
		    });

		    thisWindow.on("closed", function () 
		    {
			    thisWindow = null;
		    });

		    thisWindow.loadURL(current_view[2]);
	    }
    });
	
}

app.on("ready", createWindow);

app.on("resize", function (e, x, y) 
{
	scadaWindow.setSize(x, y);
});

app.on("window-all-closed", function () 
{
	if (process.platform !== "darwin") 
	{
		app.quit();
	}
});

app.on("activate", function () 
{
	if (scadaWindow === null) 
	{
		createWindow();
	}

	if (dtWindow === null) 
	{
		createWindow();
	}
});

app.allowRendererProcessReuse = true;

function runExecutable() {
    const exePath = path.join(__dirname, 'Reef Detection/main/main.exe');
    const cwd = path.dirname(exePath); // Get the directory of main.exe

    console.log('Current Path:', __dirname);
    console.log('Executable Path:', exePath);

    const childProcess = spawn(exePath, [], { cwd: cwd });

    childProcess.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        scadaWindow.webContents.send('exe-result', 'Error running the executable.');
    });

    childProcess.on('exit', (code) => {
        if (code === 0) {
            console.log('Execution completed successfully');
        } else {
            console.error(`Execution exited with code ${code}`);
            scadaWindow.webContents.send('exe-result', `Execution exited with code ${code}`);
        }
    });

    // Optional: Listen to the child process output (stdout and stderr) if needed
    childProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        scadaWindow.webContents.send('exe-result', data);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        scadaWindow.webContents.send('exe-result', data);
    });
}

ipcMain.on('run-exe', () => {
	runExecutable();
});

exports.runExecutable = runExecutable;




