const webSocket = new WebSocket("ws://" + settings['Control Box IP'] + settings['Control Box PORT']);

webSocket.Send = (msg) =>
{
    webSocket.send(JSON.stringify(msg));
}

