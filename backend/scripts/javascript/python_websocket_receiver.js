const net 				= require('net');
const webSocketSender	= require("./websocket_sender.js");
const pythonSender  	= require("./python_websocket_sender.js");

/*TCP server configuration*/
const PORT 				= 65432;

/*Create a TCP server*/
const server 			= net.createServer(socket => 
{
	/*Handle incoming data*/
	let data 				= '';
	
	socket.on('data', chunk => 
	{
		data 				+= chunk;
	});

	/*Handle end of data transmission*/
	socket.on('end', () => 
	{
		try 
		{	
			const imageJson 	= JSON.parse(data);
			
			console.log(imageJson);
			
			const imageType 	= imageJson.Type;
			const imageSpec 	= imageJson.Spec;
			const imageData 	= imageJson.Data;
			
			if (imageType === "Image Data")
			{
				if (imageSpec === "Status")
				{
					if (imageData === "Running")
					{
						pythonSender.SendData(
						{
							"Type": "Image Data",
							"Spec":	"Request",
							"Data":	"Cameras available"
						});	
					}
				}
				else if (imageSpec === "Cameras available")
				{
					pythonSender.SendData(
					{
						"Type": "Image Data",
						"Spec": "Link cameras",
						"Data":
						{
							"Left top": 	40358947,  
							"Left bottom": 	1234,  
							"Right top": 	1234, 
							"Right bottom": 1234
						}
					});	
				}
				else
				{
					const {'Byte Stream': 	encodedImage} 	= imageData;

					webSocketSender.Send(
					{
						"type": "Image Data Response",
						"spec":	imageJson.Spec,
						"data":	encodedImage
					});
				}
			}
		} 
		catch (error) 
		{
			if (imageType === "Image Data")
			{
				if (imageSpec === "Status")
				{
					if (imageData === "Running")
					{
						pythonSender.SendData(
						{
							"Type": "Image Data",
							"Spec":	"Request",
							"Data": "Fail"
						});	
					}
				}
				else if (imageSpec === "Status")
				{
					pythonSender.SendData(
					{
						"Type": "Image Data Response",
						"Spec": "Link cameras",
						"Data": "Fail"
					});	
				}
				else
				{
					const {'Byte Stream': 	encodedImage} 	= imageData;

					webSocketSender.Send(
					{
						"type": "Image Data",
						"spec":	imageJson.Spec,
						"data":	"Fail"
					});
				}
			}
		}
		/*Close the socket*/
		socket.end();
	});
});

/*Start the TCP server*/
server.listen(PORT, () => 
{
	//console.log(`Server listening on port ${PORT}`);
});
