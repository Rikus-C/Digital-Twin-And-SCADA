var api                 = require("./api.js")
var webSocketObj        = require("./websocket_sender.js");
var startupSettings     = require("../../settings/default.json");
var connectionCounter   = 0;

webSocketObj.Socket.on("connection", (ws) => 
{   
    connectionCounter += 1;
    
    if (connectionCounter == 2)
    {
        var msg = "Success";
		
        setTimeout(function() 
		{
			webSocketObj.Send(
			{
				"type": "Start Up Push",
				"spec":	"",
				"data":	msg
			}); 
		}, 100);   
    }

    ws.on("message", (msg) =>
	{    
        api.ReadFrontendMessage(JSON.parse(msg));
    });
});