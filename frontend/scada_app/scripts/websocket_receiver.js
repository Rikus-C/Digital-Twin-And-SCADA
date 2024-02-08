webSocket.addEventListener("open", () => 
{
	
});

webSocket.addEventListener("message", (msg) => 
{
	ReadMessage(JSON.parse(msg.data));
});
