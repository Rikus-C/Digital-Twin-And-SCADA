const net 			= require('net');

const host 			= 'localhost';
const port 			= 65431;

var pythonSender 	= {};

pythonSender.SendData = (msg) =>
{
	const client 	= new net.Socket();

	client.connect(port, host, () => 
	{
		client.write(JSON.stringify(msg));	
		client.end();
	});

	client.on('error', (error) => 
	{
		console.error('Socket error:', error.message);
	});
}

pythonSender.CaseData = (msg) =>
{
	pythonSender.SendData(
	{
		"Type": msg.type,
		"Spec": msg.spec,
		"Data": msg.data
	});	
}

module.exports = pythonSender; 
