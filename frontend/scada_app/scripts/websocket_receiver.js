webSocket.addEventListener("open", () => 
{
	LoadNewView("overview");
});

webSocket.addEventListener("message", (msg) => 
{
	ReadMessage(JSON.parse(msg.data));
});