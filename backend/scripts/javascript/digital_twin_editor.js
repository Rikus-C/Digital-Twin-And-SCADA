const fs 				= require("fs"); 
const webSocketSender 	= require("./websocket_sender.js");
const csv				= require('csv-parser');

var dtEditor 			= {};

dtEditor.LoadModelrequest = (msg) =>
{
	fs.readFile('./backend/configs/' + msg.spec + '.json', 'utf8', (err, info) =>
	{
		if (err)
		{
			webSocketSender.Send(
			{
				"type": "Load Model Response",
				"spec":	msg.spec,
				"data":	"Fail"
			});
		}
		else 
		{
			webSocketSender.Send(
			{
				"type": "Load Model Response",
				"spec":	msg.spec,
				"data":	info
			});
		}
	});
}

dtEditor.UpdateModelRequest = (msg) =>
{
	fs.writeFile('./backend/configs/' + msg.spec + '.json', msg.data, (err) =>
	{	
		if (err)
		{
			webSocketSender.Send(
			{
				"type": "Update Model Response",
				"spec":	msg.spec,
				"data":	"fail"
			});
		}
		else 
		{
			webSocketSender.Send(
			{
				"type": "Update Model Response",
				"spec":	msg.spec,
				"data":	""
			});	
		}
	});
}

dtEditor.PartListRequest = (msg) =>
{
	/*read the contents of the folder*/
	fs.readdir("./frontend/dt_app/models/", (err, files) => 
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Part List Response",
				"spec":	"",
				"data":	"Fail"
			});
		}
		else
		{
			/*filter the list of files to include only those with a .json extension*/
			const jsonFiles = files.filter(file => file.endsWith('.glb'));

			/*create a string that lists all the .json files, delimited by \r\n*/
			info = jsonFiles.join('\r\n');

			/*Output the string to the frontend*/
			webSocketSender.Send(
			{
				"type": "Part List Response",
				"spec":	msg.spec,
				"data":	info
			});
		}	
	});
}

dtEditor.CreateModelRequest = (msg) =>
{
	fs.writeFile('./backend/configs/' + msg.spec + '.json', msg.data, (err) =>
	{	
		if (err)
		{
			webSocketSender.Send(
			{
				"type": "Create Model Response",
				"spec":	msg.spec,
				"data":	"Fail"
			});
		}
		else 
		{
			webSocketSender.Send(
			{
				"type": "Create Model Response",
				"spec":	msg.spec,
				"data":	""
			});	
		}
	});
}

dtEditor.ModelListRequest = (msg) =>
{
	/*Read the contents of the folder*/
	fs.readdir("./backend/configs/", (err, files) => 
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Model List Response",
				"spec":	msg.spec,
				"data":	"Fail"
			});
		}
		else
		{
			/*Filter the list of files to include only those with a .json extension*/
			const jsonFiles = files.filter(file => file.endsWith('.json'));

			/*Create a string that lists all the .json files, delimited by \r\n*/
			info = jsonFiles.join('\r\n');

			/*Output the string to the frontend*/
			webSocketSender.Send(
			{
				"type": "Model List Response",
				"spec":	msg.spec,
				"data":	info
			});
		}	
	});
}

dtEditor.DeleteModelRequest = (msg) =>
{
	fs.unlink("./backend/configs/" + msg.spec + ".json", (err) => 
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Delete Model Response",
				"spec":	msg.spec,
				"data":	"Fail"
			});
		}
		else
		{
			webSocketSender.Send(
			{
				"type": "Delete Model Response",
				"spec":	msg.spec,
				"data":	"Success"
			});
		}
	});
}

dtEditor.LoadModelInfoRequest = (msg) =>
{
	fs.readFile("./backend/settings/" + msg.spec + "-Info.json", 'utf8', (err, Info) =>
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Load Model Info Response",
				"spec":	"",
				"data":	"Fail"
			});
		}
		else
		{
			webSocketSender.Send(
			{
				"type": "Load Model Info Response",
				"spec":	msg.spec,
				"data":	Info
			});
		}
	});
}

dtEditor.LoadDefaultRequest = () =>
{
	fs.readFile('./backend/settings/default.json', 'utf8', (err, info) =>
	{
		if (err)
		{
			webSocketSender.Send(
			{
				"type": "Load Default Response",
				"spec":	"",
				"data":	"Fail"
			});
		}
		else 
		{
			webSocketSender.Send(
			{
				"type": "Load Default Response",
				"spec":	"",
				"data":	info
			});
		}
	});
}

dtEditor.ColorListRequest = (msg) =>
{
	/*Read the contents of the folder*/
	fs.readFile('./backend/settings/colors.json', 'utf8', (err, info) =>
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Color List Response",
				"spec":	"",
				"data":	"Fail"
			});
		}
		else
		{
			/*Output the string to the frontend*/
			webSocketSender.Send(
			{
				"type": "Color List Response",
				"spec":	"",
				"data":	info
			});
		}	
	});
}

dtEditor.ReplayDataRequest = (msg) =>
{
	/*Read the contents of the folder*/
	fs.readFile("./backend/replay/"+msg.data, 'utf8', (err, info) =>
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Replay Data Response",
				"spec":	"",
				"data":	"Fail"
			});
		}
		else
		{
			/*Output the string to the frontend*/
			webSocketSender.Send(
			{
				"type": "Replay Data Response",
				"spec":	"",
				"data":	info
			});
		}	
	});
}

dtEditor.ReplayListRequest = (msg) =>
{
	/*Read the contents of the folder*/
	fs.readdir("./backend/replay/", (err, files) => 
	{
		if (err) 
		{
			webSocketSender.Send(
			{
				"type": "Replay List Response",
				"spec":	msg.spec,
				"data":	"Fail"
			});
		}
		else
		{
			/*Filter the list of files to include only those with a .csv extension*/
			const csvFiles	= files.filter(file => file.endsWith('.csv'));

			/*Create a string that lists all the .csv files, delimited by \r\n*/
			info			= csvFiles.join('\r\n');

			/*Output the string to the frontend*/
			webSocketSender.Send(
			{
				"type": "Replay List Response",
				"spec":	msg.spec,
				"data":	info
			});
		}	
	});
}

module.exports = dtEditor; 