const net       = require('net');
const client    = new net.Socket();
const settings  = require("../../settings/comms_settings.json");

netClient = {}

netClient.client            = client;
netClient.connected         = false;
netClient.connectionError   = false;

/*Check if there is a connection to the PLC,if not wait a moment and try to connect again*/
netClient.ConnectToPLC = () =>
{
    console.log("Attempting to connect to PLC...");

    /*Try/Retry connection to PLC*/
    client.connect(settings["modbusPORT"], settings["plcIPv4"]);
}

netClient.SendRequest = (msg) =>
{
    client.write(msg);
}

module.exports = netClient;