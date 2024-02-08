/**/
const ReadMessage = (msg) =>
{
    /*if PLC data is receiecvd*/
    if (msg.type === "PLC Data Push")
    {
        UpdateValuesFromPLC(msg.data);
        AppendToDataBuffer(msg.data);
        UpdatePlots();
        return;
    }

    /*if PLC warnings/errors is receiecvd*/
    if (msg.type === "PLC Errors Push")
    {
        UpdateWarningsFromPLC(msg.data);
        AppendToWarningBuffer(msg.data);
        return;
    }
    
    /*if the data received is a page's layout*/
    if (msg.type === "Scada View Return")
    {
        /*if page was not found*/
        if (msg.data === "page error")
        {
            ShowErrorMsg("Page not found");
            return;
        }
        currentView = JSON.parse(msg.data);
        GenerateHtmlPage();
        return;
    }

    /*if message regarding the saving of the view is received*/
    if (msg.type === "Scada View Saved")
    {
        /*if view save could not take place*/
        if (msg.data === "save error") 
            ShowErrorMsg("Could not save");
        /*if view could be successfullt saved*/
        else ShowInfoMsg("View successfully saved");
        return;
    }
    
	/*Image received from Reef App*/
    if (msg.type === "Image Data Response")
    {
		const ByteStream 	= msg.data;
		const Side			= msg.spec;	
		Data2Img(ByteStream, Side);
		return;
    }

    /*Color list received*/
    if (msg.type === "Color List Response")
    {
		ColorListResponse(msg.data);
		return;
    }

    if (msg.type === "Menu Page Names And Order") {
        GenerateMenuButtons(msg.menuNames, msg.menuOrder);
    }
}
