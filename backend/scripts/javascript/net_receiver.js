require("./net_client.js");

api         = require("./api.js");
netClient   = require("./net_client.js");

netClient.client.on("error", (err) => 
{
  console.log("Connection to PLC failed\n\n");
  netClient.client.destroy();
  setTimeout(()=>{netClient.ConnectToPLC()}, 2000);
});

netClient.client.on("connect", () => 
{
  console.log("Program connected to PLC\n\n");
  netClient.connected = true;
  api.RunMainLoop();
});

netClient.client.on("data", (data) => 
{
  console.log(data);
  api.ReadModbusMessage(data);
});


