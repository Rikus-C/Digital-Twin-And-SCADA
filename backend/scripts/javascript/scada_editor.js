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

scadaEditor.UpdateMenuOrderList = (newList) => {
    // Convert the new data to JSON format
    const jsonData = JSON.stringify({"Page Order": newList}, null, 2); // The second argument is for pretty printing with indentation

    // Write data to the file
    fs.writeFile("./backend/settings/SCADA_button_order.json", jsonData, (err) => {
        if (err) return;
        // Sned to frontend that save was made
        scadaEditor.SendBackLayoutFileNamesAndOrder();
    });
}

scadaEditor.AddNewMenuButton = (name) => {
    // Write data to the file
    const jsonString = JSON.stringify({"elements": []}, null, 2);
    fs.writeFile("./backend/settings/layouts/" + name + ".json", jsonString, (err) => {
        if (err) return;
        // Read button order list
        fs.readFile("./backend/settings/SCADA_button_order.json", 'utf8', (err, data) => {
            if (err) return;
            try {
                // Parse the JSON data
                var jsonData = JSON.parse(data);
                jsonData["Page Order"].push(name);
                var jsonString = JSON.stringify(jsonData, null, 2); 
                // Update the button order list
                fs.writeFile("./backend/settings/SCADA_button_order.json", jsonString, (err) => {
                    if (err) return;
                    scadaEditor.SendBackLayoutFileNamesAndOrder();
                }); 
            } catch {return}            
        });
    });
} 

scadaEditor.DeleteMenuButton = (name) => { 
    // Delete the file
    fs.unlink("./backend/settings/layouts/" + name + ".json", (err) => {
        if (err) return;
        scadaEditor.SendBackLayoutFileNamesAndOrder(); 
    });
}

module.exports = scadaEditor;











