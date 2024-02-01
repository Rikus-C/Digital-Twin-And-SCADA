const Socket 	= new WebSocket("ws://" + settings['Control Box IP'] + settings['Control Box PORT']);
const sendQueue = [];

Socket.addEventListener("open", () => 
{
	sendQueue.forEach(data => Socket.send(data));
	sendQueue.length = 0;
	
	console.log("Digital Twin websocket connected");
});

Socket.write = (msg) =>
{
	if (Socket.readyState === WebSocket.OPEN) 
	{
		Socket.send(JSON.stringify(msg));
	} 
	else 
	{
		sendQueue.push(JSON.stringify(msg));
	}
}

