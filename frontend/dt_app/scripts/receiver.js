Socket.addEventListener('message', (msg) =>
{
	var Type = JSON.parse(msg.data).type;
	var Spec = JSON.parse(msg.data).spec;
	var Data = JSON.parse(msg.data).data;
	
	if (Type === "Start Up Push")
	{
		if (Data === "Fail")
		{
			Swal.fire('Backend could not start');
		}
		else
		{
			/*Ready to send default data, we do not call sender directly to keep receiver integrity*/
			LoadDefaultRequest();
		}
	}
	else if (Type === "Load Default Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Could not load default data');
		}
		else
		{
			/*Load the default data*/
			LoadDefaultResponse(Data);
		}
	}
	else if (Type === "Model List Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Could not load models');
		}
		else
		{
			ModelListResponse(Data);
		}
	}
	else if (Type === "Part List Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Could not load parts');
		}
		else
		{
			PartListResponse(Data);
		}
	}
	else if (Type === "Load Model Response")
	{
		if (Data === "Fail")
		{ 
			Swal.fire('Load model fail');
		}
		else
		{	/*Load a model*/
			LoadModelResponse(JSON.parse(Data));	
		}
	}
	else if (Type === "Load Model Info Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Could not load part display data');
		}
		else
		{	/*Load a model's info*/
			LoadModelInfoResponse(Data);
		}
	}
	else if (Type === "Update Model Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Update model fail');
		}
		else
		{
			Swal.fire('Update model successful');
		}
	}
	else if (Type === "Color List Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Could not load colors');
		}
		else
		{
			ColorListResponse(Data);
		}
	}
	else if (Type === "Create Model Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Create model fail');
		}
		else
		{
			Swal.fire('Create model successful');
			CreateModelResponse();
		}
	}
	else if (Type === "Delete Model Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Delete model fail');
		}
		else
		{
			DeleteModelResponse();
			Swal.fire('Delete model successful');
		}
	}
	else if (Type === "PLC Data Push")
	{
		if (Data === "Fail")
		{
			Swal.fire('PLC data fail');
		}
		else
		{
			PlcDataPush(Data);
		}
	}
	else if (Type === "Replay Data Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Replay data fail');
		}
		else
		{
			ReplayDataResponse(Data);
		}
	}
	else if (Type === "PLC Error Push")
	{
		if (Data === "Fail")
		{
			Swal.fire('PLC Errors fail');
		}
		else
		{
			PlcErrorsPush(Data);
		}
	}
	else if (Type === "Replay List Response")
	{
		if (Data === "Fail")
		{
			Swal.fire('Replay list fail');
		}
		else
		{
			ReplayListResponse(Data);
		}
	}
});

