const fs = require('fs');
const webSocket = require("./websocket_sender");

scadaEditor = {};

scadaEditor.SaveCurrentView = (msg) =>
{
    fs.writeFile("./backend/settings/layouts/" + msg.spec + ".json", JSON.stringify(msg.data), (err) =>
    {
        /*if the file is not saved successfully*/
        if (err) 
        {
            webSocket.Send(
            {
                type: "Scada View Saved", 
                data: "save error"
            });
        }

        /*if the file was saved successfully*/
        else
        {
            webSocket.Send(
            {
                type: "Scada View Saved", 
                data: "success"
            });
        }
    });
}

scadaEditor.ReturnLayout = (msg) =>
{
    fs.readFile("./backend/settings/layouts/" + msg.data + ".json", "utf8", (err, data) => 
    {
        /*if the file is not found*/
        if (err) 
        {
            webSocket.Send(
            {
                type: "Scada View Return", 
                data: "page error"
            });
        }

        /*if the file is found and valid*/
        else
        {
            webSocket.Send(
            {
                type: "Scada View Return", 
                data: data
            });
        }
    });
}

module.exports = scadaEditor;