var currentViewName     	= "";
var borderColor         	= "cyan"
var currentView         	= {};
var editMode            	= false;
var swalBusy            	= false;
var followMouse         	= false;
var reefButtons				= false;
var editSensitivity     	= 1;
var selectedElements    	= [];
//const { ipcRenderer } 		= require('electron');
var listedColors			= [];
var listedColorsValues		= [];
var reefName				= false;
var renaming                = false;

var ReefHtmlAsText 			= 	"<div id='reef-left-div' 	class='reef-div' style='display: block;'><img id='reef-left' 	class='reef-image' src='' alt=''></div>"+
								"<div id='reef-right-div' 	class='reef-div' style='display: block;'><img id='reef-right' 	class='reef-image' src='' alt=''></div>"+
								"<div id='reef_1' class='reef'>"+
								"	<button id='reef_1-button' class='reef-button' type='button'></button>"+
								"	<div id='reef-text' class='reef-child'>"+
								"		Start Detect"+
								"	</div>"+
								"</div>"+
								"<div id='reef_2' class='reef'>"+
								"	<button id='reef_2-button' class='reef-button' type='button'></button>"+
								"	<div id='reef-text' class='reef-child'>"+
								"		Stop Detect"+
								"	</div>"+
								"</div>"+
								"<div id='reef_3' class='reef'>"+
								"	<button id='reef_3-button' class='reef-button' type='button'></button>"+
								"	<div id='reef-text' class='reef-child'>"+
								"		New Hole"+
								"	</div>"+
								"</div>"+
								"<div id='reef_4' class='reef'>"+
								"	<button id='reef_4-button' class='reef-button' type='button'></button>"+
								"	<div id='reef-text' class='reef-child'>"+
								"		Change Color"+
								"	</div>"+
								"</div>"+
								"<div id='loader'>"+
								"	<div id='spinner'></div>"+
								"</div>;"
							

// /*Starting reef detection exe*/
// ipcRenderer.on('exe-result', (event, result) => 
// {
// 	//console.log("send");
// });

/*Start the exe for the reef detection*/
function runExe() 
{
	if (listedColors.length === 0)
	{
		document.getElementById('loader').style.display 	= "block";
	
		ipcRenderer.send('run-exe');
		ColorListRequest();
	}
	else
	{
		Swal.fire(
		{
			title:				'Start Decect',
			text: 				'Reef Detection Already Started.',
			icon: 				'error',
			confirmButtonText: 	'OK'
		});
	}
}

/*Stop the exe for the reef detection*/
function stopExe() 
{
	if (listedColors.length === 0)
	{
		Swal.fire(
		{
			title:				'Stop Decect',
			text: 				'Reef Detection Already Stopped.',
			icon: 				'error',
			confirmButtonText: 	'OK'
		});
	}
	else
	{
		listedColors.length			= 0;
		listedColorsValues.length	= 0;
		
		webSocket.Send(
		{
			"type": "Image Data",
			"spec": "Request",
			"data":	"Exit"
		});
	}
}

/*Get a name for the new hole for reef detection*/
function newHole() 
{
	if (listedColors.length === 0)
	{
		Swal.fire(
		{
			title:				'New Hole',
			text: 				'Action Not Possible. Reef Detection Not Running.',
			icon: 				'error',
			confirmButtonText: 	'OK'
		});
	}
	else
	{
		var name 				= '';
		reefName				= true;
		
		Swal.fire(
		{
			title: 					'Enter Hole Name',
			input: 					'text',
			inputPlaceholder: 		'Default Name',
			showCancelButton: 		true,
			
			inputValidator: (value) => 
			{
				name 				= value;
				
				if (!value) 
				{
					return 'Please enter a name';
				}
			}
		})
		.then((result) => 
		{
			if (result.isConfirmed) 
			{
				webSocket.Send(
				{
					"type": "Image Data",
					"spec": "New hole",
					"data": name+'_'
				});
			}

			reefName				= false;
		});
	}
	
}

/*Set the color where the reef highlights*/
function setColor() 
{
	if (listedColors.length === 0)
	{
		Swal.fire(
		{
			title:				'Change Color',
			text: 				'Action Not Possible. Reef Detection Not Running.',
			icon: 				'error',
			confirmButtonText: 	'OK'
		});
	}
	else
	{
		CallColorDropDown();
	}
}

/*Send a request to the Backend to load all color options*/
function ColorListRequest()
{
	webSocket.Send(
	{
		"type": "Color List Request",
		"spec":	"Color",
		"data":	""
	});
}

/*When the requested colorslist is received*/
function ColorListResponse(Data)
{
	List 				= JSON.parse(Data);
	
	Object.keys(List).forEach(Color =>
	{
		listedColors.push(List[Color].name);
		listedColorsValues.push(List[Color].hex);
	})
	
	if (listedColors[0] === "")
	{
		listedColors.length = 0;
	}
	
	console.log(listedColors);
	console.log(listedColorsValues);
}

/*Calls the popup menu when loading a part*/
function CallColorDropDown()
{
	reefName				= true;
	/*Create a dropdown*/
	const {value: color} 							= Swal.fire(
	{
		title: 											'Color selection',
		input: 											'select',
		
		inputOptions: 
		{
			...listedColors.reduce((obj, val) => 			({...obj, [val]: val}), {}),
		},
	  
		inputPlaceholder: 								'Select a color',
		showCancelButton:								true,
		
		inputValidator: 								(value) => 
		{
			return new Promise((resolve) => 
			{
				if (value !== '') 
				{
					resolve()
				}
				else
				{
					resolve('You need to select a color')
				}
			})
		}
	}).then((result) => 
	{
		if (result.isConfirmed)
		{	
			/*Choose the colour based on the colours value list*/
			if (result.value !== '_Specific')
			{
				var index					= listedColors.indexOf(result.value);
				
				const resultArray 			= stringToByteArray(listedColorsValues[index]);

				webSocket.Send(
				{
					"type": "Image Data",
					"spec": "Reef mask colour",
					"data":	
					{
						"RGB": resultArray,
						"Brightness": 50
					}
				});
			}
			/*If the user picked a "Specific" value, hex will be used*/
			else
			{
				const {value2: colorCode} = Swal.fire(
				{
					title: 											'Enter the color code (HEX)',
					input: 											'text',
					showCancelButton: 								true,
					inputPlaceholder: 								'FFFFFF',
					
					inputValidator: (value2) => 
					{
						return new Promise((resolve) => 
						{
							const hexRegex 									= /^[0-9A-Fa-f]+$/;
							
							/*Check if the value is hex and 6 long*/
							if ((hexRegex.test(value2)) && (value2.length === 6))
							{
								console.log(listedColorsValues['#'+value2]);
								resolve();
							} 
							else 
							{
								resolve('Not a valid 6 digit hex number');
							}
						})
					}
				});
			}
			
			selectedMeshesNames								= [];
			selectedMeshesPos								= [];
			deselectedMeshesNames							= [];
		}
	});
	reefName				= false;
}

/*Convert color string to values used by reef detection*/
function stringToByteArray(inputString) 
{
	/*Remove the leading '#' from the inputString*/
	const stringWithoutHash 	= inputString.slice(1);

	/*Split the string into three parts for each value*/
	const valueChunks 			= stringWithoutHash.match(/.{1,2}/g);

	/*Convert each value to decimal*/
	const byteArray 			= valueChunks.map(value => 
	{
		return parseInt(value, 16);
	});

	return byteArray;
}

/*Convert image data to actual picture*/
const Data2Img = (ByteStream,Side) => 
{
	
	document.getElementById('loader').style.display 	= "none";
	
	let imageElement;	
	if (Side === "Right")
	{
		/*Get the existing image element by its ID*/
		imageElement = document.getElementById('reef-right');
	}
	else
	{
		/*Get the existing image element by its ID*/
		imageElement = document.getElementById('reef-left');
	}
	/*Set the source of the image element to the base64 encoded image data*/
	imageElement.src = 'data:image/jpeg;base64,' + ByteStream;
}

/**/
const ShowErrorMsg = (msg) =>
{
  /*show error mesage*/ 
  Swal.fire(
  {
    icon:               "error",
    title:              "Error Accurred",
    text:               msg,
    timer:              1500,
    showConfirmButton:  false
  });
}

/**/
const ShowInfoMsg = (msg) =>
{
  /*show error mesage*/ 
  Swal.fire(
  {
    icon:               "info",
    title:              "System Info",
    text:               msg,
    timer:              1500,
    showConfirmButton:  false
  });
}

/**/
const LoadNewView = (viewID) =>
{
  /*if a sweet alert windows is already open*/
  if (swalBusy) return;

  followMouse         = false;
  borderColor         = "cyan";
  selectedElements    = [];
  editMode            = false;
  currentViewName     = viewID;

  webSocket.Send(
  {
    "type": "Load New Scada View",
    "data":	viewID
  });
}

/*Reef Detection with with buttons*/
const LoadReefView = () =>
{
	document.getElementById("main_display").innerHTML = ReefHtmlAsText;
	
	if (reefButtons === false)
	{
		document.getElementById('reef_1-button').addEventListener("click", () => {ReefButton("1");});
		document.getElementById('reef_2-button').addEventListener("click", () => {ReefButton("2");});
		document.getElementById('reef_3-button').addEventListener("click", () => {ReefButton("3");});
		document.getElementById('reef_4-button').addEventListener("click", () => {ReefButton("4");});
		
		reefButtons = true;
	}
}

/**/
const SendData = () =>
{
  webSocket.Send(
  {
    "type": "Send Depth",
		"spec":	"",
    "data":	"69420"
  });
}

/**/
const SaveCurrentView = () =>
{
  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  webSocket.Send(
  {
    "type": "Save Current View",
    "spec": currentViewName,
    "data":	currentView
  });
}

/**/
const EditModeSelect = () =>
{
  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  followMouse   = false;
  borderColor   = "cyan"
  editMode      = !editMode;

  ShowInfoMsg("Edit Mode Entered");

  /*if program is currently in edit mode*/
  if (editMode) return;

  ShowInfoMsg("Edit Mode Exited");

  selectedElements.forEach((id) => 
  {
    document.getElementById(id).style.border = "solid rgba(0, 0, 0, 0) 2px";
  });

  selectedElements = [];
}

/**/
const SelectElementInView = (id) =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if element is being deselected*/
  if (selectedElements.includes(id))
  {
    document.getElementById(id).style.border = "solid rgba(0, 0, 0, 0) 2px";
    selectedElements = selectedElements.filter(item => item !== id);
  }

  /*if element is being selected*/
  else 
  {
    document.getElementById(id).style.border = "solid " + borderColor + " 2px";
    selectedElements.push(id);
  }
}

/**/
const GenerateHtmlPage = () =>
{
  var newInnerHTML    = "";
  graphList            = [];

  currentView.elements.forEach((element) => 
  {
    var borderType = "solid rgba(0, 0, 0, 0) 2px;";

    /**/
    if (selectedElements.includes(element.id))
      borderType = "solid " + borderColor + " 2px;";

    /*if the type of element is an image*/
    if (element.type === "image")
    {
      newInnerHTML += 
      "<img src = '../images/"+ element.class + ".png' " +
      "id = '" + element.id + "' " +
      "width = '" + element.width + "px' " +
      "height = '" + element.height + "px' " +
      "style ='left: " + element.x_pos + "%; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg);" +
      "border:" + borderType + " " +
      "position: absolute;'></img>\n";
    }

    /*if the type of element shows a tag's value*/
    else if (element.type === "value")
    {
      newInnerHTML +=
      "<div class =" + element.class + " " +
      "id = '" + element.id + "' " +
      "style ='left: " + element.x_pos + "%; " +
      "width: " + element.width + "px; " +
      "height: " + element.height + "px; " +
      "line-height: " + element.height + "px; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'></div>\n";
    }

    /*if the type of element shows a warning or error*/
    else if (element.type === "warning")
    {
      newInnerHTML +=
      "<div class = warning " +
      "id = '" + element.id + "' " +
      "style ='left: " + element.x_pos + "%; " +
      "width: " + element.width + "px; " +
      "height: " + element.height + "px; " +
      "line-height: " + element.height + "px; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'>" +
      "<div class=" + element.class + "></div></div>\n";
    }

    /*if the type of element shows a digital output*/
    else if (element.type === "digital")
    {
      newInnerHTML +=
      "<div class = digital " +
      "id = '" + element.id + "' " +
      "style ='left: " + element.x_pos + "%; " +
      "width: " + element.width + "px; " +
      "height: " + element.height + "px; " +
      "line-height: " + element.height + "px; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'>" +
      "<div class=" + element.class + "></div></div>\n";
    }

    /*if the type of element shows a warning or error*/
    else if (element.type === "border")
    {
      newInnerHTML +=
      "<div class = border " +
      "id = '" + element.id + "' " +
      "style ='left: " + element.x_pos + "%; " +
      "width: " + element.width + "px; " +
      "height: " + element.height + "px; " +
      "line-height: " + element.height + "px; " +
      "position: absolute;" +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'>" +
      "<div class =" + element.class + "></div></div>\n";
    }

    /*if the type of element shows a warning or error*/
    else if (element.type === "text")
    {
      newInnerHTML +=
      "<p class = txt " +
      "id = '" + element.id + "' " +
      "width = '" + element.width + "px' " +
      "height = '" + element.height + "px' " +
      "style ='left: " + element.x_pos + "%; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'>" + element.class + "</p>\n";
    }

    /*if the type of element is a plot*/
    else if (element.type === "plot")
    {
      newInnerHTML +=
      "<div class = plot " +
      "id = '" + element.id + "'" +
      "style ='left: " + element.x_pos + "%; " +
      "width: " + element.width + "px; " +
      "height: " + element.height + "px; " +
      "line-height: " + element.height + "px; " +
      "top: " + element.y_pos +"%; " +
      "transform: rotate("+ element.rotate +"deg); " +
      "border:" + borderType + "'>" +
      "<canvas class=" + element.class + 
      " id='" + element.id + "-p'></canvas></div>\n";
      graphList.push(element.id);
    }
  });

  document.getElementById("main_display").innerHTML = newInnerHTML;
  UpdateValuesFromBuffer();
  UpdateWarningsFromBuffer();
  CreatePlots();
}

const ChangeEditSensitivity = () =>
{
  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  swalBusy = true;

  Swal.fire(
  {
    title: "New Edit Sensitivity:",
    html: "<input id='swal-input' class='swal2-input'>",
    showCancelButton: true,
    confirmButtonText: "Change Sensitivity",
    cancelButtonText: "Cancel",
    focusConfirm: false,

    preConfirm: () => 
    {
      return document.getElementById("swal-input").value
    }
  })

  .then((result) => 
  {
    swalBusy = false;

    /*if results are filled in and submitted by user*/
    if (result.isConfirmed) 
      editSensitivity = parseFloat(result.value);        
  });
}

/**/
const ShowElementInformation = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;

  /**/
  for (var i = 0; i < currentView.elements.length; i++)
  {
    /**/
    if (currentView.elements[i].id === selectedElements[0])
    {
      var newHTML = "<table>"

      /**/
      Object.keys(currentView.elements[i]).forEach((key) =>
      {
        newHTML += "<tr><td>" + key + ":</td><td>" + 
        currentView.elements[i][key] + "</td></tr>";
      });

      newHTML += "</table>";
      break;
    }
  }

  Swal.fire(
  {
    icon:   "info",
    title:  "Element Info",
    html:   newHTML
  });
}

/**/
const ElementSpecialEdit = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;

  let selectedNum;
  var validSelection = false;
  renaming = true;

  /**/
  for (var i = 0; i < currentView.elements.length; i++)
  {
    /**/
    if (currentView.elements[i].id === selectedElements[0])
    {
      selectedNum     = i;
      validSelection  = true;
    }
  }

  /*if an invalid selection to edit was made*/
  if (!validSelection) return;

  swalBusy = true;

  Swal.fire(
  {
    title: "Enter Element's Information",
    html: "<input id='swal-input1' class='swal2-input' value='" + 
    currentView.elements[selectedNum].class + "'placeholder='Element Class'>" +
    "<input id='swal-input2' class='swal2-input' value='" + 
    currentView.elements[selectedNum].id + "'placeholder='Uniwue ID'>",
    showCancelButton: true,
    confirmButtonText: "Update Element",
    cancelButtonText: "Cancel",
    focusConfirm: false,

    preConfirm: () => 
    {
      var inputs =  
      [
        document.getElementById("swal-input1").value,
        document.getElementById("swal-input2").value
      ];
      return inputs;
    }
  })

  .then((result) => 
  {
    swalBusy = false;
    renaming = false;
    /*if results are filled in and submitted by user*/
    if (result.isConfirmed) 
    {
      currentView.elements[selectedNum].class = result.value[0];
      currentView.elements[selectedNum].id    = result.value[1];
      selectedElements[0]                     = result.value[1];
      GenerateHtmlPage();
    } 
  });
}

/**/
const SendToFront = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;

  for (var i = 0; i < currentView.elements.length; i++)
  {
    let toFront;

    /**/
    if (currentView.elements[i].id === selectedElements[0])
    {
      toFront = currentView.elements[i];
      currentView.elements.splice(i, 1);
      currentView.elements.push(toFront);
      GenerateHtmlPage();
      break;
    }
  }
}

/**/
const SendToBack = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;

  for (var i = 0; i < currentView.elements.length; i++)
  {
    let toBack;

    /**/
    if (currentView.elements[i].id === selectedElements[0])
    {
      toBack = currentView.elements[i];
      currentView.elements.splice(i, 1);
      currentView.elements.unshift(toBack);
      GenerateHtmlPage();
      break;
    }
  }
}

/**/
const CopyAndPaste = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  /*if follow mouse mode is active*/
  if (followMouse) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;
    
  for (var i = 0; i < currentView.elements.length; i++)
  {
    /**/
    if (currentView.elements[i].id === selectedElements[0])
    {
      var toCopy      = {};      
      toCopy.type     = currentView.elements[i].type
      toCopy.width    = currentView.elements[i].width
      toCopy.height   = currentView.elements[i].height
      toCopy.rotate   = currentView.elements[i].rotate      
      toCopy.x_pos    = (parseInt(currentView.elements[i].x_pos) + 1).toString();
      toCopy.y_pos    = (parseInt(currentView.elements[i].y_pos) + 1).toString();
      toCopy.class    = currentView.elements[i].class;
      toCopy.id       = currentView.elements[i].id + "-copy";      
      currentView.elements.push(toCopy);
      document.getElementById(currentView.elements[i].id).style.border = "solid rgba(0, 0, 0, 0) 2px";
      selectedElements = [toCopy.id];
      GenerateHtmlPage();
      ElementSpecialEdit();
      break;
    }
  }
}

const ActivateStickyMouse = () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  followMouse = !followMouse;

  /**/
  if (followMouse) borderColor = "red";

  /**/
  else borderColor = "cyan";

  GenerateHtmlPage();
}

/**/
const StickToMouse = (click) =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  currentView.elements.forEach((element, index) => 
  {
    /**/
    if (selectedElements.includes(element.id))
    {
      var maxWidth    = 2000;
      var maxHeight   = 1100;
      var xPercentage = click.clientX/maxWidth*100;
      var yPercentage = click.clientY/maxHeight*100;
      /*
      console.log(maxWidth);
      console.log(maxHeight);
      console.log("\n")
      console.log(xPercentage);
      console.log(yPercentage);
      console.log("\n")
      */      
      currentView.elements[index].x_pos = Math.round(xPercentage.toString());
      currentView.elements[index].y_pos = Math.round(yPercentage.toString());
    }
  });       
  GenerateHtmlPage();
}

/**/
const EditElementsProperties = (key) =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  var toEdit = [];

  /*if user want to move selected item left*/
  if (key === "ArrowLeft") toEdit = ["x_pos", "-"];

  /*if user want to move selected item right*/
  else if (key === "ArrowRight") toEdit = ["x_pos", "+"];

  /*if user want to move selected item up*/
  else if (key === "ArrowUp") toEdit = ["y_pos", "-"];

  /*if user want to move selected item down*/
  else if (key === "ArrowDown") toEdit = ["y_pos", "+"];

  /*if user want to increase selected item's hight*/
  else if (key === "p") toEdit = ["height", "+"];

  /*if user want to decrease selected item's hight*/
  else if (key === "l") toEdit = ["height", "-"];

  /*if user want to increase selected item's width*/
  else if (key === "o") toEdit = ["width", "+"];

  /*if user want to decrease selected item's width*/
  else if (key === "k") toEdit = ["width", "-"];

  /*if user wants to rotate selected item right*/
  else if (key === "i") toEdit = ["rotate", "+"];

  /*if user wants to rotate selected item left*/
  else if (key === "j") toEdit = ["rotate", "-"];

  /*if user wants to increase sensitivity*/
  else if (key === "m") ChangeEditSensitivity();

  /*if user wants to view element properties*/
  else if (key === "n") ShowElementInformation();

  /*if user wants to edit properties of elements*/
  else if (key === "b") ElementSpecialEdit();

  /*if user wants to edit properties of elements*/
  else if (key === "h") SendToBack();

  /*if user wants to edit properties of elements*/
  else if (key === "u") SendToFront();

  /*if user wants to edit properties of elements*/
  else if (key === "c") CopyAndPaste();

  /*if user wants to edit properties of elements*/
  else if (key === "q") ActivateStickyMouse();
    
  /*if no valid edit key was pressed*/
  else return;

  /*if edit sensitivity is invalid value*/
  if (editSensitivity < 0) editSensitivity = 0;

  /*if special edit commnads were used*/
  if ((key === "m")||(key === "n")||
      (key === "b")||(key === "u")||
      (key === "h")||(key === "c")||
      (key === "q")) return;

  let currentValue
  let newValue

  currentView.elements.forEach((element, index) => 
  {
    /**/
    if (selectedElements.includes(element.id))
    {
      currentValue = currentView.elements[index][toEdit[0]];
         
      /*if values must increase*/
      if (toEdit[1] === "+")
        newValue = parseFloat(currentValue) + editSensitivity;

      /*if values must decrease*/    
      if (toEdit[1] === "-")
        newValue = parseFloat(currentValue) - editSensitivity;

      currentView.elements[index][toEdit[0]] = newValue.toString();
    }
  });    
  GenerateHtmlPage();
}

/**/
const DeleteElementFromView = async () =>
{
  /* the D key might be used for some other typing */
  if (renaming) return;

  /*if program is currently in edit mode*/
  if (!editMode) return;

  /*if there is not only one element selected*/
  if (selectedElements.length !== 1) return;
    
  for (var i = 0; i < currentView.elements.length; i++)
  {
    /*if the correct element to delete is found*/
    if (currentView.elements[i].id === selectedElements[0])
    {
      currentView.elements.splice(i, 1);      
      break;
    }
  }
  selectedElements = [];
  GenerateHtmlPage();
}

/**/
const AddNewElementToPage = async () =>
{
  /*if program is not currently in edit mode*/
  if (!editMode) return;

  /*if a sweet alert windows is allready open*/
  if (swalBusy) return;

  swalBusy = true;

  var newElementInfo = 
  {
    class:  "",
    id:     "",
    type:   "",
    width:  0,
    height: 0,
    x_pos:  0,
    y_pos:  0, 
    rotate: 0
  };
    
  var newElementType =
  [
    "image",
    "value",
    "warning",
    "digital",
    "border",
    "text",
    "plot"
  ];

  // Show the SweetAlert popup with the dropdown list
  Swal.fire(
  {
    title:              'Add New Element',
    input:              "select",
    inputOptions:       newElementType,
    inputPlaceholder:   'Element Type',
    showCancelButton:   true,
    confirmButtonText:  'Next',
    cancelButtonText:   'Cancel',

    inputValidator: (value) => 
    {
      /*if nothing was selected*/
      if (!value) return 'You need to select an option';
    }
  })
    
  .then((result) => 
  {
    /**/
    if (result.isConfirmed) 
    {
      newElementInfo.type = newElementType[result.value];

      Swal.fire(
      {
        title: "New Element's Information:",
        html: "<input id='swal-input1' class='swal2-input' placeholder='Element Class'>" +
        "<input id='swal-input2' class='swal2-input' placeholder='Unique ID'>" +
        "<input id='swal-input3' class='swal2-input' placeholder='Width (px)'>" +
        "<input id='swal-input4' class='swal2-input' placeholder='Height (px)'>" +
        "<input id='swal-input5' class='swal2-input' placeholder='x-Position (%)'>" +
        "<input id='swal-input6' class='swal2-input' placeholder='y-Position (%)'>" +
        "<input id='swal-input7' class='swal2-input' placeholder='Rotation (deg)'>",
        showCancelButton: true,
        confirmButtonText: "Add Element",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        
        preConfirm: () => 
        {
          var inputs =  
          [
            document.getElementById("swal-input1").value,
            document.getElementById("swal-input2").value,
            document.getElementById("swal-input3").value,
            document.getElementById("swal-input4").value,
            document.getElementById("swal-input5").value,
            document.getElementById("swal-input6").value,
            document.getElementById("swal-input7").value
          ];
          return inputs;
        }
      })
        
      .then((result) => 
      {
        swalBusy = false;
        
        /*if results are filled in and submitted by user*/
        if (result.isConfirmed) 
        {
          newElementInfo.class    = result.value[0];
          newElementInfo.id       = result.value[1];
          newElementInfo.width    = result.value[2];
          newElementInfo.height   = result.value[3];
          newElementInfo.x_pos    = result.value[4];
          newElementInfo.y_pos    = result.value[5];
          newElementInfo.rotate   = result.value[6];
          currentView.elements.push(newElementInfo);
          GenerateHtmlPage();
        } 
      });
    }
  });  
}

/*Button presses on reef detect page*/
const ReefButton = (btnID) =>
{
	var btn = document.getElementById('reef_'+btnID+'-button');
	
	switch (parseInt(btnID))
	{
		case 1:	runExe();
				break;
		case 2: stopExe();
				break;
		case 3: newHole();
				break;
		case 4: setColor();
				break;
	}
}
