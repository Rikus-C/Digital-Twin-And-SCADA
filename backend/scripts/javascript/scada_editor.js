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

scadaEditor.SendBackLayoutFileNamesAndOrder = () => {
    // Get names of all layout JSON files
    fs.readdir("./backend/settings/layouts/", (err, files) => {
        if (err) return;

        files.forEach((fileName, index) => {
            files[index] = fileName.replace(".json", "");
        }); 

        // Send back JSON file content of menu button orders
        fs.readFile("./backend/settings/SCADA_button_order.json", 'utf8', (err, data) => {
            if (err) return;
            try {
                // Parse the JSON data into a JavaScript object
                var jsonData = JSON.parse(data);

                webSocket.Send({
                    type: "Menu Page Names And Order",
                    menuNames: files,
                    menuOrder: jsonData["Page Order"]
                });
            } catch {return};     
        }); 
    });
}

module.exports = scadaEditor;











