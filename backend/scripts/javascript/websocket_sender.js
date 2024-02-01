const webSocket     = require('ws');
var webSocketSender = {};
const settings      = require("../../settings/comms_settings.json");

webSocketSender.Socket = new webSocket.Server(
{
    port: settings["frontendPORT"]
});

webSocketSender.Send = (msg) => 
{   
    webSocketSender.Socket.clients.forEach(function each(client) 
	{    
        client.send(JSON.stringify(msg));
    });
}

module.exports = webSocketSender; 
