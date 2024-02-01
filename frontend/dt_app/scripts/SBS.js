var plcData 		= {};
var plcErrors 		= {};
var plcInfo			= [];
var init			= false;

var EStop 			= false;

var errorList		= [];
var warningList		= [];
var errorListInfo	= [];
var warningListInfo	= [];
var flicker			= false;

var displayInfo		= false;

/*Used for gripper sim*/
var actuator		= [0,0,0,0];
var director		= [true,true,true,true];

/*Shows the distance of the thrust cylinder extension*/
var extendThrust 	= 0;

/*Shows the distance of the stages to the machine cylinder extension*/
var extendStages 	= 0;

/*Used to debug the cutter numbers*/
var cutter			= 0;
var cutterTemps		= [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];

/*Used to debug bunker levels*/
var bunkerLevels	= [20,0];
var bunkerLevelsDir	= [true,true];
var bunkerLevelsWE	= [0,0];
var filterLeft		= [0.1,0];
var filterRight		= [0,0.1];
var filterLeftWE	= [0,0,0];
var filterRightWE	= [0,0,0];
var filterLeftDir	= [true,true];
var filterRightDir	= [true,true];

/*Show a group 1=All, 2=Top, 3=Bottom, 4=Stroke, 5=CutterHead*/
var showGroup		= 0;

/*Group used to rotate cutterhead with cutters*/
var groupCutterHead;

/*Group used to move the bottom stroke parts*/
var groupStroke;

/*Group used to move all the bottom parts*/
var groupMachine;

/*Group used to move the top parts*/
var groupStages;

/*Group used to move the all parts*/
var groupAll;
var assnAll			= false;
var showAll			= false;

/*Material used for all transparent flicker*/
var transparentMaterial;

/*Path of the hole*/
var groundMaterial;
var axisY;
var axisY;
var axisZ;
var finalTube;
var displayFinal	= false;
var groundWithoutTubes;
var finalWithCap;

/*SBS Simulation 0=Stroke, 1=Ungrip, 2=Retract, 3=Grip*/
var simState		= 3;
var firstGrip		= false;
var machinePos		= 0;
var stagesPos		= 0;
var slack 			= 0;
var modeText;
var fastForward		= 1;
var fastForwardFlag	= false;

/*Initialise the model*/
function SBS_Init()
{
	groupCutterHead 			= new BABYLON.TransformNode("groupCutterHead", scene);
	groupMachine 				= new BABYLON.TransformNode("groupMachine", scene);
	groupStroke					= new BABYLON.TransformNode("groupStroke", scene);
	groupStages 				= new BABYLON.TransformNode("groupStages", scene);
	groupAll 					= new BABYLON.TransformNode("groupAll", scene);
	
	if (Operator)
	{
		var inject =
		"<div id='infoSelect' class='infoSelect'>"+
		"	<div id='infoSelect-button' class='infoSelect-child'>"+
		"		<input type='checkbox' id='infoSelect-switch' onclick='InfoSelectChange(this);'/><label for='infoSelect-switch'></label>"+
		"	</div>"+
		"	<div id='infoSelect-text' class='infoSelect-child'>"+
		"		Auto Info Off"+
		"	</div>"+
		"</div>";
		document.getElementById('menuDiv').innerHTML = document.getElementById('menuDiv').innerHTML+inject;	
	}
	
	document.getElementById("block_tl_menu-text").innerHTML = "Steering";
	document.getElementById("block_tr_menu-text").innerHTML = "Bunker";
	document.getElementById("block_bl_menu-text").innerHTML = "Thrust";
	document.getElementById("block_br_menu-text").innerHTML = "Cutter Temp";
	document.getElementById("extra-text").innerHTML 		= "Groups";
	
	document.getElementById("block_br").style.overflowY 	= "Scroll";
	document.getElementById("block_tr").style.overflowY 	= "Scroll";
	
	var block 					= document.getElementById('block_tl');
	block.innerHTML 			= 	"<div id='steering-circle-div' 				class='steering-circle-div'>"+
										"<img id='steering-circle' 					class='steering-circle' 			src='./css/SBS-circle.png'>"+
										"<img id='steering-sbs-top' 				class='steering-top' 				src='./css/SBS-Top.png'>"+
										"<img id='steering-sbs-gripper-left' 		class='steering-sbs-gripper-left' 	src='./css/SBS-gripper.png'>"+
										"<img id='steering-sbs-gripper-top' 		class='steering-sbs-gripper-top' 	src='./css/SBS-gripper.png'>"+
										"<img id='steering-sbs-gripper-bottom' 		class='steering-sbs-gripper-bottom' src='./css/SBS-gripper.png'>"+
										"<img id='steering-sbs-gripper-right' 		class='steering-sbs-gripper-right' 	src='./css/SBS-gripper.png'>"+
									"</div>"+
									"<table id='steering-table' class='steering-table'>"+
										"<colgroup>"+
											"<col width='75%'>"+
											"<col width='25%'>"+
										"</colgroup>"+
									"<th colspan='2'>Grippers Extension</th>"+
									"</table>";
									
	block 						= document.getElementById('block_br');
	var inject					= 	"<div id='cutter-display' 					class='cutter-display'>"+
										"<img id='cutter-base' 						class='cutter-base' 				src='./css/cutters/cutters-base.png'>";
	
	for (i = 1; i < 32; i++)
	{
		inject 						= inject+"<img id='cutter-warn-"+i+"' 				class='cutter-warn' 				src='./css/cutters/cutters-warn-"+i+".png'>";
	}
	
	for (i = 1; i < 32; i++)
	{
		inject 						= inject+"<img id='cutter-err-"+i+"' 				class='cutter-err' 					src='./css/cutters/cutters-err-"+i+".png'>";
	}
	
	inject 						= inject+"</div><table id='cutter-table' class='cutter-table'>";
	block.innerHTML				= inject;
	
	
	block 						= document.getElementById('block_bl');
	block.innerHTML				= 	"<div id='thrust-display' 					class='thrust-display'>"+
										"<img id='thrust-back' 						class='thrust-back' 				src='./css/sbs_thrust_back.png'>"+
										"<img id='thrust-bot' 						class='thrust-bot' 					src='./css/sbs_thrust_bot.png'>"+
										"<img id='thrust-top' 						class='thrust-top' 					src='./css/sbs_thrust_top.png'>"+
									"</div>"+
									"<table id='thrust-table' class='thrust-table'>";
	
	block 						= document.getElementById('block_tr');
	block.innerHTML 			= 	"<div id='bunker-div' 						class='bunker-div'>"+
										"<img id='bunker-back' 						class='bunker-back' 				src='./css/Filters back.png'>"+
										"<img id='bunker-mid-left' 					class='bunker-mid-left'  			src='./css/Rocks.png'>"+
										"<img id='bunker-mid-right' 				class='bunker-mid-right'  			src='./css/Rocks.png'>"+
										"<img id='bunker-front' 					class='bunker-front' 				src='./css/Filters front.png'>"+
										"<img id='bunker-red-bl' 					class='bunker-extra'  				src='./css/Filters front red - bl.png'>"+
										"<img id='bunker-red-br' 					class='bunker-extra'  				src='./css/Filters front red - br.png'>"+
										"<img id='bunker-red-tl' 					class='bunker-extra'  				src='./css/Filters front red - tl.png'>"+
										"<img id='bunker-red-tr' 					class='bunker-extra'  				src='./css/Filters front red - tr.png'>"+
										"<img id='bunker-orange-bl' 				class='bunker-extra'  				src='./css/Filters front orange - bl.png'>"+
										"<img id='bunker-orange-br' 				class='bunker-extra'  				src='./css/Filters front orange - br.png'>"+
										"<img id='bunker-orange-tl' 				class='bunker-extra'  				src='./css/Filters front orange - tl.png'>"+
										"<img id='bunker-orange-tr' 				class='bunker-extra'  				src='./css/Filters front orange - tr.png'>"+
										"<img id='bunker-red-pbl' 					class='bunker-extra'  				src='./css/Filters front red - pbl.png'>"+
										"<img id='bunker-red-pbr' 					class='bunker-extra'  				src='./css/Filters front red - pbr.png'>"+
										"<img id='bunker-red-ptl' 					class='bunker-extra'  				src='./css/Filters front red - ptl.png'>"+
										"<img id='bunker-red-ptr' 					class='bunker-extra'  				src='./css/Filters front red - ptr.png'>"+
										"<img id='bunker-orange-pbl' 				class='bunker-extra'  				src='./css/Filters front orange - pbl.png'>"+
										"<img id='bunker-orange-pbr' 				class='bunker-extra'  				src='./css/Filters front orange - pbr.png'>"+
										"<img id='bunker-orange-ptl' 				class='bunker-extra'  				src='./css/Filters front orange - ptl.png'>"+
										"<img id='bunker-orange-ptr' 				class='bunker-extra'  				src='./css/Filters front orange - ptr.png'>"+
									"</div>"+
									"<table id='bunker-table' class='bunker-table'>"+
									"	<colgroup>"+
											"<col width='75%'>"+
											"<col width='25%'>"+
									"	</colgroup>"+
									"	<th colspan='2'>Filter Pressures</th>"+
									"	<tr><td>Filter Left (Before):</td>	<td id='FilterLeftBefore'	></td></tr>"+
									"	<tr><td>Filter Left (After):</td>	<td id='FilterLeftAfter'	></td></tr>"+
									"	<tr><td>Filter Left (Delta):</td>	<td id='FilterLeftDelta'	></td></tr>"+
									"	<tr><td>Filter Right (Before):</td>	<td id='FilterRightBefore'	></td></tr>"+
									"	<tr><td>Filter Right (After):</td>	<td id='FilterRightAfter'	></td></tr>"+
									"	<tr><td>Filter Right (Delta):</td>	<td id='FilterRightDelta'	></td></tr>"+
									"	<th colspan='2'>Bunker Levels</th>"+    
									"	<tr><td>Bunker Left:</td>			<td id='BunkerLeft'			></td></tr>"+
									"	<tr><td>Bunker Right:</td>			<td id='BunkerRight'		></td></tr>"+
									"</table>"
									
	block 					= document.getElementById('block_tr2');
	block.innerHTML 			= 	"<div id='path' class='sbs-path'>"+
										"<div id='path-text' class='sbs-path-child'>"+
											"Path"+
										"</div>"+
										"<button id='path-button' class='sbs-path-button' onmouseup='SBS_Path_Button();' type='button'></button>"+
									"</div>"+
									"<div id='line-top' 	class='sbs-line-top'></div>"+
									"<div id='line-text' 	class='sbs-line-child'></div>"+
									"<div id='line-bottom' 	class='sbs-line-bottom'></div>"+
									"<div id='sbs-all' class='sbs-all'>"+
										"<div id='sbs-all-text' class='sbs-all-child'>"+
											"All"+
										"</div>"+
										"<button id='sbs-all-button' class='sbs-all-button' onmouseup='SBS_Group_Select(this);' type='button'></button>"+
									"</div>"+
									"<div id='stages' class='sbs-all'>"+
										"<div id='stages-text' class='sbs-all-child'>"+
											"Stages"+
										"</div>"+
										"<button id='stages-button' class='sbs-all-button' onmouseup='SBS_Group_Select(this);' type='button'></button>"+
									"</div>"+
									"<div id='machine' class='sbs-all'>"+
										"<div id='machine-text' class='sbs-all-child'>"+
											"Machine"+
										"</div>"+
										"<button id='machine-button' class='sbs-all-button' onmouseup='SBS_Group_Select(this);' type='button'></button>"+
									"</div>"+
									"<div id='stroke' class='sbs-all'>"+
										"<div id='stroke-text' class='sbs-all-child'>"+
											"Stroke"+
										"</div>"+
										"<button id='stroke-button' class='sbs-all-button' onmouseup='SBS_Group_Select(this);' type='button'></button>"+
									"</div>"+
									"<div id='cutterhead' class='sbs-all'>"+
										"<div id='cutterhead-text' class='sbs-all-child'>"+
											"Cutter Head"+
										"</div>"+
										"<button id='cutterhead-button' class='sbs-all-button' onmouseup='SBS_Group_Select(this);' type='button'></button>"+
									"</div>";
	block 						= document.getElementById('block_mr');
	block.innerHTML 			= 	"<table id='distance-table' class='distance-table'>"+
									"	<colgroup>"+
											"<col width='75%'>"+
											"<col width='25%'>"+
									"	</colgroup>"+
									"	<tr><td id='mode-text' colspan='2' style='text-align: center; font-size: 20px;'></td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"	<tr><td>Stages (T):</td>	<td id='stages-top-text'	>-41.900m</td></tr>"+
									"	<tr><td>Stages (B):</td>	<td id='stages-bottom-text'	>-12.800m</td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"	<tr><td>Slack:</td>			<td id='slack-dist-text'	>0.000m</td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"	<tr><td>Machine (T):</td>	<td id='machine-top-text'	>-12.800m</td></tr>"+
									"	<tr><td>Machine (B):</td>	<td id='machine-bottom-text'>0.300m</td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"	<tr><td>Stroke:</td>		<td id='stroke-dist-text'	>0.000m</td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"	<tr><td>Overall:</td>		<td id='overall-text'		>5.000m</td></tr>"+
									"	<tr><td colspan='2'><hr></td></tr>"+
									"</table>";
	
	document.getElementById('slowest-button').style.background 	= "grey";
	document.getElementById('slower-button').style.background 	= "grey";
	document.getElementById('play-button').style.background 	= "grey";
	document.getElementById('faster-button').style.background 	= "grey";
	document.getElementById('fastest-button').style.background 	= "grey";	
	
	modeText					= document.getElementById('mode-text'); 
	
	var btnAll 					= document.getElementById('sbs-all-button'); 
	btnAll.style.background		= "#bada55";
	
	text 						= document.getElementById('extra2-text');
	text.innerHTML 				= "Replay";
	
	//stagesPos					= new BABYLON.Vector3(0,-6,0);
	//machinePos					= new BABYLON.Vector3(0,-24.75,0);
	
	// Create a semi-transparent box around the meshes
	transparentMaterial 		= new BABYLON.StandardMaterial("transparentMaterial", scene);
	transparentMaterial.alpha 	= 0.5;
	
	LoadModelRequest();
	
	init 						= true;
}

/*All model functions to be performed before rendering*/
function SBS_PreRender()
{
	SBS_ErrorHandler();
	
	if ((!EStop) && (document.getElementById("loader").style.display === "none"))
	{
		/*
			SBS_Rotate();
			SBS_Grip();
			SBS_Thrust();	
			SBS_Cutter_Temp();
			SBS_Bunkers();
		*/
		
		if (!assnAll)
		{
			SBS_Groups();
		}
		else
		{
			SBS_Simulation();
		}
		
		//SBS_UpdateBox();
	}
}

/*Handle the model data*/
function SBS_Data(Data)
{
	plcData		= Data;
	
	Object.keys(plcData).forEach(Data =>
	{
		plcData[Data].value		= (Math.round(plcData[Data].value*1000))/1000;
	});
	
	first = false;
	
	//SBS_Table();
}

/*Handle the model errors and warnings*/
function SBS_Errors(Errors)
{
	plcErrors 		= Errors;
	EStop 			= false;
	
	SBS_Table();
	
	Object.keys(plcErrors).forEach(Error =>
	{
		if ((plcErrors[Error].value === 1) && (plcErrors[Error].lookup === -1))
		{
			EStop = true;
		}
	})
	
	errorList		= [];
	warningList		= [];
	errorListInfo	= [];
	warningListInfo	= [];
	
	var tempErrArr 	= [];
	var tempWarnArr = [];
	var display 	= "";
	var lookup 		= "";

	plcInfo.forEach(Part =>
	{
		Info 		= Part[1];
		tempErrArr 	= [];
		tempWarnArr = [];
		
		Info.forEach(Tag =>
		{
			display = Tag;
			
			var DataKeys = Object.keys(plcData);
			
			for (j = 0; j < DataKeys.length; j++)
			{
				//Check if the infor/sensor name is in the received names
				if (display === plcData[DataKeys[j]].name)
				{
					lookup = plcData[DataKeys[j]].lookup;

					if ((lookup !== 0) && (lookup !== -1))
					{
						var ErrorKeys = Object.keys(plcErrors);
					
						for (i = 0; i < ErrorKeys.length; i++)
						{ 
							if (typeof(plcErrors[ErrorKeys[i]].lookup) === 'number')
							{
								var errorLookup = [plcErrors[ErrorKeys[i]].lookup,0];
							}
							else
							{
								var errorLookup = plcErrors[ErrorKeys[i]].lookup;
							}
							
							for (k = 0; k < errorLookup.length; k++)
							{
								//Check for error with lookup key
								if ((lookup === errorLookup[k]) && (lookup !== "0"))
								{
									//Check if error is active
									if (plcErrors[ErrorKeys[i]].value === 1)
									{
										if (plcErrors[ErrorKeys[i]].type === "error")
										{
											tempErrArr.push(display);
										}
										else if (plcErrors[ErrorKeys[i]].type === "warning")
										{
											tempWarnArr.push(display);
										}	
									}
								}
							}
						}	
					}	
					
					break;
				}
			}
		})
		
		if (tempErrArr.length > 0)
		{
			errorList.push(Part[0]);
			errorListInfo.push(tempErrArr);
		}
		
		if (tempWarnArr.length > 0)
		{
			warningList.push(Part[0]);
			warningListInfo.push(tempWarnArr);
		}
	});
	
	if (((errorList.length > 0) || (warningList.length > 0)) && (!displayInfo))
	{
		PartsInfoRequest();
		displayInfo = true;
	}
}

/*Change the model table values*/
function SBS_Table()
{
	var table	= document.getElementById("sensorTable");
		var inject 	= 	"<colgroup>"+
						"	 <col width='75%'>"+
						"	 <col width='25%'>"+
						"</colgroup>";
		
	if (dataErrorSelect)
	{
		Object.keys(plcData).forEach(key =>
		{
			if (key.substring(key.length - 4,key.length) === "Temp")
			{
				inject 	= inject+"<tr><td>"+plcData[key].name+":</td><td>"+cutterTemps[parseInt(key.substring(7,key.length - 5)) - 1].toString()+"°C</td></tr>";
			}
			else if ((key.substring(key.length - 4,key.length) === "ance") && (key.substring(0,4) === "Grip"))
			{
				inject 	= inject+"<tr><td>"+plcData[key].name+":</td><td>"+actuator[parseInt(key.substring(8,9)) - 1].toString()+"mm</td></tr>";
			}
			else if ((key.substring(key.length - 4,key.length) === "ance") && (key.substring(0,4) === "Thru"))
			{
				inject 	= inject+"<tr><td>"+plcData[key].name+":</td><td>"+Math.round((extendThrust*10)).toString()+"mm</td></tr>";
			}
			else if ((key.substring(key.length - 4,key.length) === " RPM") && (key.substring(0,4) === "Cutt"))
			{
				inject 	= inject+"<tr><td>"+plcData[key].name+":</td><td>"+plcData[key].value+"rpm</td></tr>";
			}
			else
			{
				inject 	= inject+"<tr><td>"+plcData[key].name+":</td><td>"+plcData[key].value+"</td></tr>";
			}
		});	
	}
	else
	{
		Object.keys(plcErrors).forEach(key =>
		{
			inject 	= inject+"<tr><td>"+plcErrors[key].name+":</td><td>"+plcErrors[key].value+"</td></tr>";
		});
	}
	
	table.innerHTML = inject;
}

/*Handle the model part info*/
function SBS_Info(Info)
{
	if ((!modelInit) && (!modelReload))
	{
		var foundIndex 	= false;
		var customHTML 	= '<table style="width: 100%; table-layout: fixed;"><colgroup><col style="width: 75%;"><col style="width: auto;"></colgroup>';
		
		if (EStop)
		{
			customHTML  	= customHTML+'<tr><td><b style="color:#FF0000;"><font size="+2">EStop:</font></b></td><td><b style="color:#FF0000";"><font size="+2">true</font></b></td></tr>';
		}
		
		var displays 	= [];
		var PartKeys	= Object.keys(Info.Parts);
		
		for (i = 0; i < PartKeys.length; i ++)
		{	
			var name 		= Info.Parts[PartKeys[i]].name;
			var info 		= Info.Parts[PartKeys[i]].info;
			var selIndex 	= selectedMeshesNames.indexOf(name);
			var errIndex	= errorList.indexOf(name);
			var warnIndex	= warningList.indexOf(name);
			
			displays 		= Info.Parts[PartKeys[i]].displays.split(',');
			name 			= name.substring(name.indexOf(") ") + 2,name.length);
			
			if (name.indexOf("rod") === -1)
			{		
				if (((selIndex > -1) || (errIndex > -1)) || (warnIndex > -1))
				{	
					foundIndex		= true;
					
					if (errIndex > -1)
					{
						customHTML  	= customHTML+'<th colspan="2" style="color: #FF0000">'+info+'</th>';	
					}
					else if (warnIndex > -1)
					{
						customHTML  	= customHTML+'<th colspan="2" style="color: #FFA500">'+info+'</th>';	
					}
					else
					{
						customHTML  	= customHTML+'<th colspan="2">'+info+'</th>';	
					}
					
				
					for (j = 0; j < displays.length; j ++)
					{
						if (typeof plcData[displays[j]] !== 'undefined')
						{
							var value = plcData[displays[j]].value;
							
							if ((errIndex === -1) && (warnIndex === -1))
							{
								customHTML	= customHTML+'<tr><td>'+displays[j]+':</td><td>'+value+'</td></tr>';	
							}
							else if ((errIndex === -1) && (warnIndex > -1))
							{
								/*Get index of display/sensor warning*/
								var warnInfoIndex = -1
								
								for (k = 0; k < warningListInfo[warnIndex].length; k++)
								{
									if (warningListInfo[warnIndex][k] === displays[j])
									{
										warnInfoIndex = k;
										break;
									}									
								}
								
								if (warnInfoIndex > -1)
								{
									customHTML	= customHTML+'<tr><td style="color: #FFA500;">'+displays[j]+':</td><td style="color: #FFA500;">'+value+'</td></tr>';
								}
								else
								{
									customHTML	= customHTML+'<tr><td>'+displays[j]+':</td><td>'+value+'</td></tr>';
								}	
							}
							else if (errIndex > -1)
							{
								/*Get index of display/sensor error*/
								var errInfoIndex = -1
								
								for (k = 0; k < errorListInfo[errIndex].length; k++)
								{
									if (errorListInfo[errIndex][k] === displays[j])
									{
										errInfoIndex = k;
										break;
									}									
								}
									
								if (errInfoIndex > -1)
								{
									customHTML	= customHTML+'<tr><td style="color: #FF0000;">'+displays[j]+':</td><td style="color: #FF0000;">'+value+'</td></tr>';
								}
								else
								{
									customHTML	= customHTML+'<tr><td>'+displays[j]+':</td><td>'+value+'</td></tr>';
								}
							}
							else
							{
								customHTML	= customHTML+'<tr><td>'+displays[j]+':</td><td>'+value+'</td></tr>';
							}	
						}	
					}
				}
			}
		}		
		
		if (foundIndex)
		{
			customHTML  = customHTML+'</table>';
			
			Swal.fire(
			{
				position: 	'top-end',	
				title:		'Part Information',
				html: 		customHTML,
				backdrop: 	false
			});		
		}
	}
	else
	{
		plcInfo			= [];
		var displays 	= [];
		
		Object.keys(Info.Parts).forEach(Part =>
		{
			var tempArr = [];
			
			displays 	= Info.Parts[Part].displays.split(',');
			
			for (i = 0; i < displays.length; i++)
			{
				tempArr.push(displays[i]);
			}
			
			plcInfo.push([Info.Parts[Part].name,tempArr]);
		});
	}
}

/*Change the colors of affected parts*/
function SBS_ErrorHandler()
{
	/*Check error flicker every 30 frames*/
	if (scene.getFrameId() % 30 === 0) 
	{
		if (EStop)
		{
			Object.keys(plcInfo).forEach(Part =>
			{
				name 		= plcInfo[Part][0];
				var mesh 	= scene.getMeshById(name);
				
				if (mesh)
				{
					if (!flicker)
					{	
						mesh.material.diffuseColor 	= new BABYLON.Color3.Red();
						mesh.material.albedoColor 	= new BABYLON.Color3.Red();
					}
					else
					{
						var index = selectedMeshesNames.indexOf(name);
						
						if (index > -1)
						{
							mesh.material.diffuseColor 	= new BABYLON.Color3.Green();
							mesh.material.albedoColor 	= new BABYLON.Color3.Green();
						}
						else
						{
							index = deselectedMeshesNames.indexOf(name);
						
							if (index > -1)
							{
								mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#3D4547");
								mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
							}
							else
							{
								index = newModelNames.indexOf(name);
								
								if (index > -1)
								{
									mesh.material.diffuseColor 	= newModelColor[index];
									mesh.material.albedoColor 	= newModelColor[index];
								}
								else
								{
									index = newPartNames.indexOf(name);
									
									if (index > -1)
									{
										mesh.material.diffuseColor 	= newPartColor[index];
										mesh.material.albedoColor 	= newPartColor[index];
									}									
								}
							}
						}
					}	
				}
			});	
		}
		else
		{
			if (errorList.length > 0)
			{
				errorList.forEach(name =>
				{
					var mesh = scene.getMeshById(name);
					
					if (mesh)
					{
						if (!flicker)
						{
							mesh.material.diffuseColor 	= new BABYLON.Color3.Red();
							mesh.material.albedoColor 	= new BABYLON.Color3.Red();
						}
						else
						{
							var index = selectedMeshesNames.indexOf(name);
							
							if (index > -1)
							{
								mesh.material.diffuseColor 	= new BABYLON.Color3.Green();
								mesh.material.albedoColor 	= new BABYLON.Color3.Green();
							}
							else
							{
								index = deselectedMeshesNames.indexOf(name);
							
								if (index > -1)
								{
									mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#3D4547");
									mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
								}
								else
								{
									index = newModelNames.indexOf(name);
									
									if (index > -1)
									{
										mesh.material.diffuseColor 	= newModelColor[index];
										mesh.material.albedoColor 	= newModelColor[index];
									}
									else
									{
										index = newPartNames.indexOf(name);
										
										if (index > -1)
										{
											mesh.material.diffuseColor 	= newPartColor[index];
											mesh.material.albedoColor 	= newPartColor[index];
										}		
									}
								}
							}
						}	
					}
				});	
			}
			
			if (warningList.length > 0)
			{
				warningList.forEach(name =>
				{
					if (errorList.indexOf(name) === -1)
					{
						var mesh = scene.getMeshById(name);
						
						if (mesh)
						{
							if (!flicker)
							{
								mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#FFA500");
								mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FFA500");
							}
							else
							{
								var index = selectedMeshesNames.indexOf(name);
								
								if (index > -1)
								{
									mesh.material.diffuseColor 	= new BABYLON.Color3.Green();
									mesh.material.albedoColor 	= new BABYLON.Color3.Green();
								}
								else
								{
									index = deselectedMeshesNames.indexOf(name);
								
									if (index > -1)
									{
										mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#3D4547");
										mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
									}
									else
									{
										index = newModelNames.indexOf(name);
										
										if (index > -1)
										{
											mesh.material.diffuseColor 	= newModelColor[index];
											mesh.material.albedoColor 	= newModelColor[index];
										}
										else
										{
											index = newPartNames.indexOf(name);
											
											if (index > -1)
											{
												mesh.material.diffuseColor 	= newPartColor[index];
												mesh.material.albedoColor 	= newPartColor[index];
											}		
										}
									}
								}
							}
						}						
					}
				});	
			}
		}
		
		flicker = !flicker;	
	}
}

/*Assign SBS parts to groups*/
function SBS_Groups()
{
	if (newModel.length === 55)
	{
		newModel.forEach(Model =>
		{
			var snippet 		= Model.idname.substring(6,12);
			if (snippet === "gearbo")
			{
				Model.position.y 	= -22.18 - extendThrust/100;
				Model.parent 		= groupStroke;
			}
			else if (snippet === "bottom")
			{
				Model.position.y 	= -20.66 - extendThrust/100;
				Model.parent 		= groupStroke;
			}
			else if ((((snippet === "top se") || (snippet === "stage ")) || ((snippet === "grippe") || (snippet === "collec"))) && (assnAll === false))
			{
				Model.parent 		= groupMachine;
			}
		
			var snippet 				= Model.idname.substring(13,17);
			
			if (snippet === "disc")
			{
				Model.parent 				= groupCutterHead;
			}
			else if (snippet === "utte")
			{
				Model.parent 				= groupCutterHead;
			}
			else if (snippet === "head")
			{
				Model.parent 				= groupCutterHead;
			}
		});
	
		groupCutterHead.parent 	= groupStroke;
		
		newModel.forEach(Model =>
		{
			if (Model.parent === null)
			{
				Model.parent 			= groupStages;
			}
		});

		groupStroke.parent 		= groupMachine;
		groupMachine.parent		= groupAll;
		groupStages.parent		= groupAll;

		SBS_AlignGroup(groupAll);
		
		assnAll 				= true;
	}
}

/*Grip function to handle steering data*/
function SBS_Grip()
{
	if (init && renderComplete)
	{
		var random 	= Math.floor(Math.random() * 4);
		let max 	= Math.max(...actuator);
		let min 	= Math.min(...actuator);
		var move	= true;
		
		/*Ungrip*/
		if (simState === 1)
		{
			if (max > 0)
			{
				director[random] = false;
				
				if (actuator[random] > 0)
				{
					actuator[random] -= 2*fastForward;
				}
				else
				{
					actuator[random] = 0;
				}
			}
			else
			{
				move 		= false;
				simState	= 2;
				
				if (fastForwardFlag)
				{
					SBS_FastForward(false);
				}
			}
		}
		/*Grip*/
		else if (simState === 3)
		{
			if (!(min < 200) || (machinePos > -3))
			{
				move 		= false;
				
				if (slack >= 4.5)
				{
					simState 		= 4;
				
					if (fastForwardFlag)
					{
						SBS_FastForward(false);
					}	
				}
				else
				{
					simState		= 0;
				
					if (fastForwardFlag)
					{
						SBS_FastForward(false);
					}
				}
			}
			else
			{
				director[random] = true;
				
				if (actuator[random] < 200)
				{
					actuator[random] += 2*fastForward;
				}
				else
				{
					actuator[random] = 200;
				}
			}
		} 
		/*else if (!assnAll)
		{
			if (actuator[random] === 200)
			{
				director[random] = false;
			}
			else if (actuator[random] === 0)
			{
				director[random] = true;
			}
			
			if (director[random])
			{
				actuator[random] += 2;
			}
			else
			{
				actuator[random] -= 2;
			}
		}*/
		
		if (move)
		{
			var actuator3D 	= Math.round((actuator[random]*0.0021)*1000)/1000;
			var meshName	= "(SBS) gripper block "+(random + 1);
			var gripper3D	= scene.getMeshById(meshName);
			
			if (random === 0)
			{
				actuator2D 				= Math.round((-22.2 - actuator[random]*0.0085)*1000)/1000;
				var gripper2D			= document.getElementById("steering-sbs-gripper-top");
				gripper3D.position.z	= 1.38 - actuator3D;	
				gripper2D.style.top		= actuator2D+"vw" ;
			}
			else if (random === 1)
			{
				actuator2D 				= Math.round((7 + actuator[random]*0.0085)*1000)/1000;
				var gripper2D			= document.getElementById("steering-sbs-gripper-right");
				gripper3D.position.x	= -1.66 - actuator3D;
				gripper2D.style.left	= actuator2D+"vw" ;
			}
			else if (random === 2)
			{
				actuator2D 				= Math.round((-5.7 + actuator[random]*0.0085)*1000)/1000;
				var gripper2D			= document.getElementById("steering-sbs-gripper-bottom");
				gripper3D.position.z	= 4.7 + actuator3D;	
				gripper2D.style.top		= actuator2D+"vw" ;
			}
			else if (random === 3)
			{
				actuator2D 				= Math.round((1.6 - actuator[random]*0.0085)*1000)/1000;
				var gripper2D			= document.getElementById("steering-sbs-gripper-left");
				gripper3D.position.x	= 1.66 + actuator3D;
				gripper2D.style.left	= actuator2D+"vw" ;
			}
			
			if (actuator[random] >= 180)
			{
				gripper3D.material.diffuseColor = new BABYLON.Color3.Red();
				gripper3D.material.albedoColor 	= new BABYLON.Color3.Red();
				
				gripper2D.src = "./css/SBS-gripper-Err.png";
			}
			else if (actuator[random] >= 150)
			{
				gripper3D.material.diffuseColor = new BABYLON.Color3.FromHexString("#FFA500");
				gripper3D.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FFA500");
				
				gripper2D.src = "./css/SBS-gripper-Warn.png";
			}
			else
			{
				var index = selectedMeshesNames.indexOf(meshName);
				
				if (index > -1)
				{
					gripper3D.material.diffuseColor = new BABYLON.Color3.Green();
					gripper3D.material.albedoColor 	= new BABYLON.Color3.Green();
				}
				else
				{
					index = deselectedMeshesNames.indexOf(meshName);
				
					if (index > -1)
					{
						gripper3D.material.diffuseColor = new BABYLON.Color3.FromHexString("#3D4547");
						gripper3D.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
					}
					else
					{
						index = newModelNames.indexOf(meshName);
						
						if (index > -1)
						{
							gripper3D.material.diffuseColor = newModelColor[index];
							gripper3D.material.albedoColor 	= newModelColor[index];
						}
					}
				}
				
				gripper2D.src = "./css/SBS-gripper.png";
			}
			
			var steeringTable				= document.getElementById("steering-table");
			var inject 						= 	"<colgroup>"+
												"	 <col width='75%'>"+
												"	 <col width='25%'>"+
												"<th colspan='2'>Gripper Distances</th>";
			
			for (i = 1; i < 5; i++)
			{
				if (actuator[i - 1] >= 180)
				{
					inject 							= inject+"<tr><td>Gripper "+i+":</td><td><b style='color:#FF0000;'>"+actuator[i - 1]+"mm</b></td></tr>";
				}
				else if (actuator[i - 1] >= 160)
				{
					inject 							= inject+"<tr><td>Gripper "+i+":</td><td><b style='color:#FFA500;'>"+actuator[i - 1]+"mm</b></td></tr>";
				}
				else
				{
					inject 							= inject+"<tr><td>Gripper "+i+":</td><td>"+actuator[i - 1]+"mm</td></tr>";
				}
			}
			
			inject 							= inject+"</colgroup>";					
			steeringTable.innerHTML 		= inject;	
		}
	}
}

/*Rotate the cutterhead at a given rpm*/
function SBS_Rotate()
{
	var deltaPosTime 			= scene.getEngine().getDeltaTime()/1000;
	//var angle_cut 				= plcData['(216) Hydraulic Motor Speed'].value*0.104719755*deltaPosTime*fastForward;
	
	var angle_cut 				= 10*0.104719755*deltaPosTime*fastForward;
	groupCutterHead.rotateAround(new BABYLON.Vector3(0,-24.52,3.04), BABYLON.Vector3.Up(), angle_cut*fastForward);		
}

/*retract into the stroke with thrust cylinder*/
function SBS_Retract()
{
	extendThrust 			+= 0.3*fastForward;
	
	if (!(extendThrust >= 150) || (!(extendThrust >= (150.15)) && (fastForward === 5)) || (!(extendThrust >= (150.3)) && (fastForward === 10)))	
	{	
		groupMachine.position.y 	= Math.round((machinePos  - extendThrust/100)*1000)/1000;
		groupStroke.position.y 		= Math.round((-1.5 + (extendThrust/100))*1000)/1000;
		
		/*console.log("Machine:",groupMachine.position.y);
		console.log("Stroke:",groupStroke.position.y);*/
		
		var thurstTable					= document.getElementById("thrust-table");
		var inject 						= 	"<colgroup>"+
											"	 <col width='75%'>"+
											"	 <col width='25%'>"+
											"<th colspan='2'>Cylinder Extension</th>";
		if (extendThrust >= 135)
		{
			inject 							= inject+"<tr><td>Distance:</td><td><b style='color:#FF0000;'>"+Math.round((1.5 - extendThrust*10)).toString()+"mm</b></td></tr>";
		}
		else if (extendThrust >= 120)
		{
			inject 							= inject+"<tr><td>Distance:</td><td><b style='color:#FFA500;'>"+Math.round((1.5 - extendThrust*10)).toString()+"mm</b></td></tr>";
		}
		else
		{
			inject 							= inject+"<tr><td>Distance:</td><td>"+Math.round((1.5 - extendThrust*10)).toString()+"mm</td></tr>";
		}
		
		inject 							= inject+	"</colgroup>";
		thurstTable.innerHTML			= inject;
		
		var machineTop					= document.getElementById("machine-top-text");
		machineTop.innerHTML			= (Math.round(-1000*(groupMachine.position.y + 12.8))/1000).toFixed(3)+"m";
		
		var machineBottom				= document.getElementById("machine-bottom-text");
		machineBottom.innerHTML			= (Math.round(-1000*(groupMachine.position.y - 0.3))/1000).toFixed(3)+"m";
				
		var strokeText					= document.getElementById("stroke-dist-text");
		strokeText.innerHTML			= (Math.round(10*(150 - extendThrust))/1000).toFixed(3)+"m";
				
		var slackText					= document.getElementById("slack-dist-text");
		slack							= Math.round(Math.abs(groupStages.position.y - groupMachine.position.y + 1.5)*1000)/1000;
		slackText.innerHTML				= slack.toFixed(3)+"m";
		
		SBS_Cutter_Temp(false);
	}
	else
	{	
		extendThrust		= 0;
		machinePos			-= 1.5;
		
		simState 			= 3;
		
		if (fastForwardFlag)
		{
			SBS_FastForward(false);
		}
	}
}

/*Extend stroke with thrust cylinder*/
function SBS_Thrust()
{
	extendThrust 			+= 0.3*fastForward;
	
	if (!(extendThrust >= 150) || (!(extendThrust >= (150.15)) && (fastForward === 5)) || (!(extendThrust >= (150.3)) && (fastForward === 10)))	
	{	
		groupMachine.position.y		= machinePos;
		groupStroke.position.y 		= Math.round((-extendThrust/100)*1000)/1000;
		
		/*console.log(machinePos);
		console.log(extendThrust);
		console.log(machinePos - extendThrust/100);
		
		console.log("Machine:",groupMachine.position.y);
		console.log("Stroke:",groupStroke.position.y);*/
		
		if ((finalWithCap) && (displayFinal))
		{	
			if (finalTube)
			{
				finalTube.dispose();
			}
			
			var bottom 						= document.getElementById('thrust-bot');
			bottom.style.top				= (19 + 65/150*extendThrust).toString()+"px";

			var outerDiameter 				= 4.201;
			var innerDiameter				= 4.2;
			var height2 					= 3 + extendThrust/100 - machinePos;
				
			var outerTube2 					= BABYLON.MeshBuilder.CreateCylinder("outerTube2", { diameter: outerDiameter, height: height2 }, scene);
			var innerTube2 					= BABYLON.MeshBuilder.CreateCylinder("innerTube2", { diameter: innerDiameter, height: height2 }, scene);

			// Subtract inner tube from outer tube
			var outerCSG2 					= BABYLON.CSG.FromMesh(outerTube2);
			var innerCSG2					= BABYLON.CSG.FromMesh(innerTube2);
				
			var resultCSG2 					= outerCSG2.subtract(innerCSG2);
			finalTube 						= resultCSG2.toMesh("finalTube", null, scene);
			finalTube.position.y 			= -height2/2;
			finalTube.material 				= groundMaterial;
			
			// Dispose unnecessary meshes
			outerTube2.dispose();
			innerTube2.dispose();
			
			finalWithCap.position.y 		= -4.005 - extendThrust/100 + machinePos;
		}
			
		var thurstTable					= document.getElementById("thrust-table");
		var inject 						= 	"<colgroup>"+
											"	 <col width='75%'>"+
											"	 <col width='25%'>"+
											"<th colspan='2'>Cylinder Extension</th>";
		if (extendThrust >= 135)
		{
			inject 							= inject+"<tr><td>Distance:</td><td><b style='color:#FF0000;'>"+Math.round((extendThrust*10)).toString()+"mm</b></td></tr>";
		}
		else if (extendThrust >= 120)
		{
			inject 							= inject+"<tr><td>Distance:</td><td><b style='color:#FFA500;'>"+Math.round((extendThrust*10)).toString()+"mm</b></td></tr>";
		}
		else
		{
			inject 							= inject+"<tr><td>Distance:</td><td>"+Math.round((extendThrust*10)).toString()+"mm</td></tr>";
		}
		
		inject 							= inject+	"</colgroup>";
		thurstTable.innerHTML			= inject;
		
		var strokeText					= document.getElementById("stroke-dist-text");
		strokeText.innerHTML			= (Math.round(10*extendThrust)/1000).toFixed(3)+"m";
		
		var overallText					= document.getElementById("overall-text");
		overallText.innerHTML			= (Math.round(-1000*(machinePos + groupStroke.position.y - 5))/1000).toFixed(3)+"m";

		var camera 						= scene.activeCamera;
		
		cameraPos.y					   	-= 0.003*fastForward;
		camera.setPosition(new BABYLON.Vector3(cameraPos.x, cameraPos.y, cameraPos.z));
		
		cameraTar.y					   	-= 0.003*fastForward;
		camera.setTarget(new BABYLON.Vector3(cameraTar.x, cameraTar.y, cameraTar.z));
		
		SBS_Rotate();
		SBS_Cutter_Temp(true);
	}
	else 
	{	
		simState 			= 1;
		extendThrust		= 0;
		
		if (fastForwardFlag)
		{
			SBS_FastForward(false);
		}
	}
	
}

/*Show cutter temps*/
function SBS_Cutter_Temp(full)
{
	cutter						= Math.floor(Math.random()*32);
	
	if (full)
	{
		cutterTemps[cutter]			= Math.floor(Math.random()*100);
	}
	else
	{
		cutterTemps[cutter]			= Math.floor(Math.random()*40);
	}
	
	newModel.forEach(Model =>
	{
		var snippet 				= Model.idname.substring(13,17);
		var number 					= Model.idname.substring(18,20);
		
		if ((snippet === "disc") && (number === cutter.toString()))
		{
			if (cutterTemps[cutter - 1] >= 80)
			{
				Model.material.albedoColor 	= new BABYLON.Color3.Red();
				document.getElementById('cutter-err-'+cutter).style.display 	= "block";
			}
			else if (cutterTemps[cutter - 1] >= 60)
			{
				Model.material.albedoColor  = new BABYLON.Color3.FromHexString("#FFA500");
				document.getElementById('cutter-warn-'+cutter).style.display 	= "block"; 
			}
			else
			{
				Model.material.albedoColor 	= newModelColor[cutter];
				document.getElementById('cutter-warn-'+cutter).style.display 	= "none"; 
				document.getElementById('cutter-err-'+cutter).style.display 	= "none"; 
			}
		}
	});
	
	var cutterTable					= document.getElementById("cutter-table");
	var inject 						= 	"<colgroup>"+
										"	 <col width='75%'>"+
										"	 <col width='25%'>"+
										"<th colspan='2'>Cutter Temps</th>";
	
	for (i = 1; i <= cutterTemps.length; i++)
	{

		if (cutterTemps[i - 1] >= 80)
		{
			inject 							= inject+"<tr><td>Cutter "+i+":</td><td><b style='color:#FF0000;'>"+cutterTemps[i - 1]+"°C</b></td></tr>";
		}
		else if (cutterTemps[i - 1] >= 60)
		{
			inject 							= inject+"<tr><td>Cutter "+i+":</td><td><b style='color:#FFA500;'>"+cutterTemps[i - 1]+"°C</b></td></tr>";
		}
		else
		{
			inject 							= inject+"<tr><td>Cutter "+i+":</td><td>"+cutterTemps[i - 1]+"°C</td></tr>";
		}
	}
	
	inject 							= inject+"</colgroup>";					
	cutterTable.innerHTML 			= inject;	
}

/*Show bunker levels and filter pressures*/
function SBS_Bunkers()
{
	if (init && renderComplete)
	{
		var table 		= 	document.getElementById("bunker-table");
		var random 		= Math.floor(Math.random() * 2);
	
		if (bunkerLevels[random] === 100)
		{
			bunkerLevelsDir[random] 	= false;
		}
		else if (bunkerLevels[random] === 0)
		{
			bunkerLevelsDir[random] 	= true;
		}
		
		if (bunkerLevelsDir[random])
		{
			bunkerLevels[random] 		+= 0.5;
		}
		else
		{
			bunkerLevels[random] 		-= 0.5;
		}
		
		if (filterLeft[random] >= 1)
		{
			filterLeftDir[random] 		= false;
		}
		else if (filterLeft[random] <= 0)
		{
			filterLeftDir[random] 		= true;
		}
		
		if (filterLeftDir[random])
		{
			filterLeft[random] 			+= 0.002*Math.random()*7;
		}
		else
		{
			filterLeft[random] 			-= 0.002*Math.random()*7;
		}
		
		if (filterRight[random] >= 1)
		{
			filterRightDir[random] 		= false;
		}
		else if (filterRight[random] <= 0)
		{
			filterRightDir[random] 		= true;
		}
		
		if (filterRightDir[random])
		{
			filterRight[random] 		+= 0.002*Math.random()*7;
		}
		else
		{
			filterRight[random] 		-= 0.002*Math.random()*7;
		}
		
		if (random === 0)
		{
			var bunker2D			= document.getElementById("bunker-mid-left");
	
			if (bunkerLevels[random] >= 90)
			{
				document.getElementById("bunker-red-bl").style.display 		= "block";
				document.getElementById("bunker-orange-bl").style.display 	= "none";
				bunkerLevelsWE[random]										= 2;
			}
			else if (bunkerLevels[random] >= 80)
			{
				document.getElementById("bunker-red-bl").style.display 		= "none";
				document.getElementById("bunker-orange-bl").style.display 	= "block";
				bunkerLevelsWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-bl").style.display 		= "none";
				document.getElementById("bunker-orange-bl").style.display 	= "none";
				bunkerLevelsWE[random]										= 0;
			}
		
			if (filterLeft[random] >= 0.6)
			{
				document.getElementById("bunker-red-pbl").style.display 	= "block";
				document.getElementById("bunker-orange-pbl").style.display 	= "none";
				filterLeftWE[random]										= 2;
			}
			else if (filterLeft[random] >= 0.55)
			{
				document.getElementById("bunker-red-pbl").style.display 	= "none";
				document.getElementById("bunker-orange-pbl").style.display 	= "block";
				filterLeftWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-pbl").style.display 	= "none";
				document.getElementById("bunker-orange-pbl").style.display 	= "none";
				filterLeftWE[random]										= 0;
			}
			
			if (filterRight[random] >= 0.6)
			{
				document.getElementById("bunker-red-pbr").style.display 	= "block";
				document.getElementById("bunker-orange-pbr").style.display 	= "none";
				filterRightWE[random]										= 2;
			}
			else if (filterRight[random] >= 0.55)
			{
				document.getElementById("bunker-red-pbr").style.display 	= "none";
				document.getElementById("bunker-orange-pbr").style.display 	= "block";
				filterRightWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-pbr").style.display 	= "none";
				document.getElementById("bunker-orange-pbr").style.display 	= "none";
				filterRightWE[random]										= 0;
			}
		}
		else if (random === 1)
		{
			var bunker2D			= document.getElementById("bunker-mid-right");
	
			if (bunkerLevels[random] >= 90)
			{
				document.getElementById("bunker-red-br").style.display 		= "block";
				document.getElementById("bunker-orange-br").style.display 	= "none";
				bunkerLevelsWE[random]										= 2;
			}
			else if (bunkerLevels[random] >= 80)
			{
				document.getElementById("bunker-red-br").style.display 		= "none";
				document.getElementById("bunker-orange-br").style.display 	= "block";
				bunkerLevelsWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-br").style.display 		= "none";
				document.getElementById("bunker-orange-br").style.display 	= "none";
				bunkerLevelsWE[random]										= 0;
			}
		
			if (filterLeft[random] >= 0.6)
			{
				document.getElementById("bunker-red-ptl").style.display 	= "block";
				document.getElementById("bunker-orange-ptl").style.display 	= "none";
				filterLeftWE[random]										= 2;
			}
			else if (filterLeft[random] >= 0.55)
			{
				document.getElementById("bunker-red-ptl").style.display 	= "none";
				document.getElementById("bunker-orange-ptl").style.display 	= "block";
				filterLeftWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-ptl").style.display 	= "none";
				document.getElementById("bunker-orange-ptl").style.display 	= "none";
				filterLeftWE[random]										= 0;
			}
			
			if (filterRight[random] >= 0.6)
			{
				document.getElementById("bunker-red-ptr").style.display 	= "block";
				document.getElementById("bunker-orange-ptr").style.display 	= "none";
				filterRightWE[random]										= 2;
			}
			else if (filterRight[random] >= 0.55)
			{
				document.getElementById("bunker-red-ptr").style.display 	= "none";
				document.getElementById("bunker-orange-ptr").style.display 	= "block";
				filterRightWE[random]										= 1;
			}
			else
			{
				document.getElementById("bunker-red-ptr").style.display 	= "none";
				document.getElementById("bunker-orange-ptr").style.display 	= "none";
				filterRightWE[random]										= 0;
			}
		}
		
		bunker2D.style.height	= 3.5+bunkerLevels[random]/10+"vw";
		
		var filterLeftDif 		= Math.abs(filterLeft[0] - filterLeft[1]);
		var filterRightDif 		= Math.abs(filterRight[0] - filterRight[1]);
		
		if (filterLeftDif >= 0.2)
		{
			filterLeftWE[2] 	= 2;
		}
		else if (filterLeftDif >= 0.15)
		{
			filterLeftWE[2] 	= 1;
		}
		else
		{
			filterLeftWE[2] 	= 0;
		}
		
		if (filterRightDif >= 0.2)
		{
			filterRightWE[2] 	= 2;
		}
		else if (filterRightDif >= 0.15)
		{
			filterRightWE[2] 	= 1;
		}
		else
		{
			filterRightWE[2] 	= 0;
		}
		
		var FilterLeftBefore	= document.getElementById('FilterLeftBefore');
		var FilterLeftAfter		= document.getElementById('FilterLeftAfter');
		var FilterLeftDelta		= document.getElementById('FilterLeftDelta');
		var FilterRightBefore	= document.getElementById('FilterRightBefore');
		var FilterRightAfter	= document.getElementById('FilterRightAfter');
		var FilterRightDelta	= document.getElementById('FilterRightDelta'); 
		var BunkerLeft			= document.getElementById('BunkerLeft');
		var BunkerRight			= document.getElementById('BunkerRight');
		
		switch (bunkerLevelsWE[0])
		{
			case 2:
				BunkerLeft.style.color 		= "#FF0000";
				BunkerLeft.innerHTML  		= "<b>"+Math.round(bunkerLevels[0]*1000)/1000+"%</b>";
				break;
			case 1:
				BunkerLeft.style.color 		= "#FFA500";
				BunkerLeft.innerHTML  		= "<b>"+Math.round(bunkerLevels[0]*1000)/1000+"%</b>";
				break;
			case 0:
				BunkerLeft.style.color		= "#FFFFFF";
				BunkerLeft.innerHTML  		= Math.round(bunkerLevels[0]*1000)/1000+"%";
				break;
		}
		
		switch (bunkerLevelsWE[1])
		{
			case 2:
				BunkerRight.style.color 	= "#FF0000";
				BunkerRight.innerHTML  		= "<b>"+Math.round(bunkerLevels[1]*1000)/1000+"%</b>";
				break;
			case 1:
				BunkerRight.style.color 	= "#FFA500";
				BunkerRight.innerHTML  		= "<b>"+Math.round(bunkerLevels[1]*1000)/1000+"%</b>";
				break;
			case 0:
				BunkerRight.style.color		= "#FFFFFF";
				BunkerRight.innerHTML  		= Math.round(bunkerLevels[1]*1000)/1000+"%";
				break;
		}
		
		switch (filterLeftWE[0])
		{
			case 2:
				FilterLeftBefore.style.color	= "#FF0000";
				FilterLeftBefore.innerHTML  	= "<b>-"+Math.round(filterLeft[0]*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterLeftBefore.style.color	= "#FFA500";
				FilterLeftBefore.innerHTML  	= "<b>-"+Math.round(filterLeft[0]*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterLeftBefore.style.color	= "#FFFFFF";
				FilterLeftBefore.innerHTML  	= "-"+Math.round(filterLeft[0]*1000)/1000+"bar";
				break;
		}
		
		switch (filterLeftWE[1])
		{
			case 2:
				FilterLeftAfter.style.color 	= "#FF0000";
				FilterLeftAfter.innerHTML  		= "<b>-"+Math.round(filterLeft[1]*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterLeftAfter.style.color 	= "#FFA500";
				FilterLeftAfter.innerHTML  		= "<b>-"+Math.round(filterLeft[1]*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterLeftAfter.style.color		= "#FFFFFF";
				FilterLeftAfter.innerHTML  		= "-"+Math.round(filterLeft[1]*1000)/1000+"bar";
				break;
		}
		
		switch (filterLeftWE[2])
		{
			case 2:
				FilterLeftDelta.style.color 	= "#FF0000";
				FilterLeftDelta.innerHTML  		= "<b>"+Math.round(filterLeftDif*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterLeftDelta.style.color 	= "#FFA500";
				FilterLeftDelta.innerHTML  		= "<b>"+Math.round(filterLeftDif*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterLeftDelta.style.color		= "#FFFFFF";
				FilterLeftDelta.innerHTML  		= Math.round(filterLeftDif*1000)/1000+"bar";
				break;
		}
		
		switch (filterRightWE[0])
		{
			case 2:
				FilterRightBefore.style.color	= "#FF0000";
				FilterRightBefore.innerHTML  	= "<b>-"+Math.round(filterRight[0]*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterRightBefore.style.color	= "#FFA500";
				FilterRightBefore.innerHTML  	= "<b>-"+Math.round(filterRight[0]*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterRightBefore.style.color	= "#FFFFFF";
				FilterRightBefore.innerHTML  	= "-"+Math.round(filterRight[0]*1000)/1000+"bar";
				break;
		}
		
		switch (filterRightWE[1])
		{
			case 2:
				FilterRightAfter.style.color 	= "#FF0000";
				FilterRightAfter.innerHTML  	= "<b>-"+Math.round(filterRight[1]*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterRightAfter.style.color 	= "#FFA500";
				FilterRightAfter.innerHTML  	= "<b>-"+Math.round(filterRight[1]*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterRightAfter.style.color	= "#FFFFFF";
				FilterRightAfter.innerHTML  	= "-"+Math.round(filterRight[1]*1000)/1000+"bar";
				break;
		}
		
		switch (filterRightWE[2])
		{
			case 2:
				FilterRightDelta.style.color 	= "#FF0000";
				FilterRightDelta.innerHTML  	= "<b>"+Math.round(filterRightDif*1000)/1000+"bar</b>";
				break;
			case 1:
				FilterRightDelta.style.color 	= "#FFA500";
				FilterRightDelta.innerHTML  	= "<b>"+Math.round(filterRightDif*1000)/1000+"bar</b>";
				break;
			case 0:
				FilterRightDelta.style.color	= "#FFFFFF";
				FilterRightDelta.innerHTML  	= Math.round(filterRightDif*1000)/1000+"bar";
				break;
		}
		
		switch (Math.max(...filterLeftWE))
		{
			case 2:
				document.getElementById("bunker-red-tl").style.display 		= "block";
				document.getElementById("bunker-orange-tl").style.display 	= "none";
				break;
			case 1:
				document.getElementById("bunker-red-tl").style.display 		= "none";
				document.getElementById("bunker-orange-tl").style.display 	= "block";
				break;
			case 0:
				document.getElementById("bunker-red-tl").style.display 		= "none";
				document.getElementById("bunker-orange-tl").style.display 	= "none";
				break;	
		}
		
		switch (Math.max(...filterRightWE))
		{
			case 2:
				document.getElementById("bunker-red-tr").style.display 		= "block";
				document.getElementById("bunker-orange-tr").style.display 	= "none";
				break;
			case 1:
				document.getElementById("bunker-red-tr").style.display 		= "none";
				document.getElementById("bunker-orange-tr").style.display 	= "block";
				break;
			case 0:
				document.getElementById("bunker-red-tr").style.display 		= "none";
				document.getElementById("bunker-orange-tr").style.display 	= "none";
				break;	
		}
	}
}

/*Show ground and whole reletive to eachother*/
function SBS_Path(ShowHidePath)
{
	if (ShowHidePath === 1)
	{
		// Create a ground material
		groundMaterial 					= new BABYLON.StandardMaterial("groundMaterial", scene);
		groundMaterial.alpha 			= 0.5;
		groundMaterial.diffuseColor 	= new BABYLON.Color3(0.6, 0.3, 0); // Brown color
		groundMaterial.albedoColor 		= new BABYLON.Color3(0.6, 0.3, 0);
		groundMaterial.backwardCulling	= false;

		// Create a ground mesh
		var groundWidth 				= 40;
		var groundHeight 				= 40;
		var groundThickness 			= 0.01;
		var ground 						= BABYLON.MeshBuilder.CreateBox("ground", 
		{
			width: 							groundWidth,
			height: 						groundThickness,
			depth: 							groundHeight
		}, scene);	
	
		ground.material 				= groundMaterial;
			
		var outerDiameter 				= 4.201;
		var innerDiameter				= 4.2;
		var height 						= 2;
			
		var outerTube 					= BABYLON.MeshBuilder.CreateCylinder("outerTube", { diameter: outerDiameter, height: height }, scene);
		var innerTube 					= BABYLON.MeshBuilder.CreateCylinder("innerTube", { diameter: innerDiameter, height: height }, scene);

		// Subtract inner tube from outer tube
		var outerCSG 					= BABYLON.CSG.FromMesh(outerTube);
		var innerCSG					= BABYLON.CSG.FromMesh(innerTube);
			
		var resultCSG 					= outerCSG.subtract(innerCSG);
		finalTube 						= resultCSG.toMesh("finalTube", null, scene);
		finalTube.position.y 			= -4;
		finalTube.material 				= groundMaterial;
		
		// Dispose unnecessary meshes
		outerTube.dispose();
		innerTube.dispose();

		// Convert ground mesh to CSG
		var groundCSG = BABYLON.CSG.FromMesh(ground);

		// Subtract tubes from ground
		var groundWithoutTubesCSG 		= groundCSG.subtract(innerCSG);
		groundWithoutTubes 				= groundWithoutTubesCSG.toMesh("groundWithoutTubes", groundMaterial, scene);
		ground.dispose();	
	
		// Create axis lines	
		axisX 							= BABYLON.MeshBuilder.CreateLines("axisX", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(20, 0, 0)] }, scene);
		axisY							= BABYLON.MeshBuilder.CreateLines("axisY", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -150, 0)] }, scene);
		axisZ 							= BABYLON.MeshBuilder.CreateLines("axisZ", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 20)] }, scene);
	
		// Call function to create tick marks for each axis
		// SBS_CreateTickMarks(axisX, new BABYLON.Vector3(1, 0, 0), 20, 1.5); // X-axis
		// SBS_CreateTickMarks(axisY, new BABYLON.Vector3(0, -1, 0), 150, 1.5); // Y-axis
		// SBS_CreateTickMarks(axisZ, new BABYLON.Vector3(0, 0, 1), 20, 1.5); // Z-axis
		
		// Create a flat cap for the bottom of the tube
		var capDiameter 				= outerDiameter; 
		var capThickness 				= 0.01; 
		var capHeight 					= capThickness;
		var cap 						= BABYLON.MeshBuilder.CreateCylinder("cap", 
		{
			diameter: 						capDiameter,
			height: 						capHeight,
			tessellation: 					24 
		}, scene);

		cap.position.y 					= -5.005;
		cap.material 					= groundMaterial;

		// Combine the cap with the finalTube using CSG union operation
		var capCSG 						= BABYLON.CSG.FromMesh(cap);
		var finalWithCapCSG 			= BABYLON.CSG.FromMesh(finalTube).union(capCSG);
		finalWithCap 					= finalWithCapCSG.toMesh("finalWithCap", null, scene);
		finalWithCap.material 			= groundMaterial;
	
		// Dispose the unnecessary cap and cap mesh
		cap.dispose();
		finalTube.dispose();
			
		var bottom 						= document.getElementById('thrust-bot');
		bottom.style.top				= (19 + 65/150*extendThrust).toString()+"px";

		var outerDiameter 				= 4.201;
		var innerDiameter				= 4.2;
		var height2 					= 3 + extendThrust/100 - machinePos;
			
		var outerTube2 					= BABYLON.MeshBuilder.CreateCylinder("outerTube2", { diameter: outerDiameter, height: height2 }, scene);
		var innerTube2 					= BABYLON.MeshBuilder.CreateCylinder("innerTube2", { diameter: innerDiameter, height: height2 }, scene);

		// Subtract inner tube from outer tube
		var outerCSG2 					= BABYLON.CSG.FromMesh(outerTube2);
		var innerCSG2					= BABYLON.CSG.FromMesh(innerTube2);
			
		var resultCSG2 					= outerCSG2.subtract(innerCSG2);
		finalTube 						= resultCSG2.toMesh("finalTube", null, scene);
		finalTube.position.y 			= -height2/2;
		finalTube.material 				= groundMaterial;
		
		finalWithCap.position.y 		= -4.005 - extendThrust/100 + machinePos;
		
		// Dispose unnecessary meshes
		outerTube2.dispose();
		innerTube2.dispose();
		
		displayFinal = true;
	}
	else
	{
		if (groundWithoutTubes) 
		{
			groundWithoutTubes.dispose();
		}

		if (finalWithCap) 
		{
			finalWithCap.dispose();
		}

		if (finalTube) 
		{
			finalTube.dispose();
			displayFinal = false;
		}

		if (axisX) 
		{
			axisX.dispose();
		}
		if (axisY) 
		{
			axisY.dispose();
		}
		if (axisZ) 
		{
			axisZ.dispose();
		}
	}
}

/*Align gorup with Axis*/
function SBS_AlignGroup(transferNode) 
{
	// Initialize min and max values with extreme values
	var minX 					= Number.MAX_VALUE;
	var minY 					= Number.MAX_VALUE;
	var minZ					= Number.MAX_VALUE;
	var maxX 					= Number.MIN_VALUE;
	var maxY 					= Number.MIN_VALUE;
	var maxZ 					= Number.MIN_VALUE;

	// Loop through each mesh in the TransformNode to find their extents
	transferNode.getChildMeshes().forEach(mesh => {
		const boundingInfo			= mesh.getBoundingInfo();
		const boundingBox 			= boundingInfo.boundingBox;

		// Update the min and max values along each axis
		minX 						= Math.min(minX, boundingBox.minimumWorld.x);
		minY 						= Math.min(minY, boundingBox.minimumWorld.y);
		minZ 						= Math.min(minZ, boundingBox.minimumWorld.z);
		maxX 						= Math.max(maxX, boundingBox.maximumWorld.x);
		maxY 						= Math.max(maxY, boundingBox.maximumWorld.y);
		maxZ 						= Math.max(maxZ, boundingBox.maximumWorld.z);
	});

	// Calculate the dimensions of the bounding box
	var boxWidth 				= maxX - minX;
	var boxHeight 				= maxY - minY;
	var boxDepth 				= maxZ - minZ;

	// Calculate the center of the bounding box
	var centerX 				= (maxX + minX) / 2;
	var centerY 				= (maxY + minY) / 2;
	var centerZ 				= (maxZ + minZ) / 2;
	
	// Calculate the difference between the transfer node's origin and the scene's origin
	var originDifference 		= transferNode.position.subtract(new BABYLON.Vector3(centerX, centerY, centerZ));

	// Move the transfer node to align its origin with the scene's origin
	groupAll.position.addInPlace(originDifference);
	groupAll.position.y 		= groupAll.position.y + 19.75;

	// Define the scene's axes based on the coordinate system
	var sceneAxisX 				= new BABYLON.Vector3(1, 0, 0); // Assuming X points right
	var sceneAxisY 				= new BABYLON.Vector3(0, 1, 0); // Assuming Y points up
	var sceneAxisZ 				= new BABYLON.Vector3(0, 0, 1); // Assuming Z points forward

	// Rotate the transfer node per axis to align with the scene's axes
	groupAll.rotate(sceneAxisX, angleBetweenVectors(groupAll.right, sceneAxisX), BABYLON.Space.WORLD);
	groupAll.rotate(sceneAxisY, angleBetweenVectors(groupAll.up, sceneAxisY), BABYLON.Space.WORLD);
	groupAll.rotate(sceneAxisZ, angleBetweenVectors(groupAll.forward, sceneAxisZ), BABYLON.Space.WORLD);

	// Function to calculate angle between vectors
	function angleBetweenVectors(vector1, vector2) {
		return Math.acos(BABYLON.Vector3.Dot(vector1.normalize(), vector2.normalize()));
	}
							
	// Rotate the groupStages around its center along the Y-axis
	const pivotPoint 			= new BABYLON.Vector3(-1*groupAll.position.x,-1*groupAll.position.y,-1*groupAll.position.z);
	groupStages.rotateAround(pivotPoint, BABYLON.Axis.Y, -0.78);
	groupStages.position.y		= -1.5;
	
	/*Align grippers for start*/
	var meshName	= "(SBS) gripper block 1";
	var gripper3D	= scene.getMeshById(meshName);
	
	actuator2D 				= Math.round((-22.2)*1000)/1000;
	var gripper2D			= document.getElementById("steering-sbs-gripper-top");
	gripper3D.position.z	= 1.38;	
	gripper2D.style.top		= actuator2D+"vw" ;
	
	var meshName	= "(SBS) gripper block 2";
	var gripper3D	= scene.getMeshById(meshName);

	actuator2D 				= Math.round((7)*1000)/1000;
	var gripper2D			= document.getElementById("steering-sbs-gripper-right");
	gripper3D.position.x	= -1.66;
	gripper2D.style.left	= actuator2D+"vw" ;
	
	var meshName	= "(SBS) gripper block 3";
	var gripper3D	= scene.getMeshById(meshName);

	actuator2D 				= Math.round((-5.7)*1000)/1000;
	var gripper2D			= document.getElementById("steering-sbs-gripper-bottom");
	gripper3D.position.z	= 4.7;	
	gripper2D.style.top		= actuator2D+"vw" ;
	
	var meshName	= "(SBS) gripper block 4";
	var gripper3D	= scene.getMeshById(meshName);

	actuator2D 				= Math.round((1.6)*1000)/1000;
	var gripper2D			= document.getElementById("steering-sbs-gripper-left");
	gripper3D.position.x	= 1.66;
	gripper2D.style.left	= actuator2D+"vw" ;
	
	var steeringTable				= document.getElementById("steering-table");
	var inject 						= 	"<colgroup>"+
										"	 <col width='75%'>"+
										"	 <col width='25%'>"+
										"<th colspan='2'>Gripper Distances</th>";
	
	for (i = 1; i < 5; i++)
	{
		if (actuator[i - 1] >= 180)
		{
			inject 							= inject+"<tr><td>Gripper "+i+":</td><td><b style='color:#FF0000;'>"+actuator[i - 1]+"mm</b></td></tr>";
		}
		else if (actuator[i - 1] >= 160)
		{
			inject 							= inject+"<tr><td>Gripper "+i+":</td><td><b style='color:#FFA500;'>"+actuator[i - 1]+"mm</b></td></tr>";
		}
		else
		{
			inject 							= inject+"<tr><td>Gripper "+i+":</td><td>"+actuator[i - 1]+"mm</td></tr>";
		}
	}
	
	inject 							= inject+"</colgroup>";					
	steeringTable.innerHTML 		= inject;
	
	var block 						= document.getElementById('block_mr');
	block.style.display				= "block";
}

/*Show group*/
function SBS_ShowGroup(transferNode) 
{
	/*Initialize variables with extreme values*/
	let minX = Number.MAX_VALUE;
	let minY = Number.MAX_VALUE;
	let minZ = Number.MAX_VALUE;
	let maxX = -Number.MAX_VALUE;
	let maxY = -Number.MAX_VALUE;
	let maxZ = -Number.MAX_VALUE;

	let minMeshXName = '';
	let minMeshYName = '';
	let minMeshZName = '';
	let maxMeshXName = '';
	let maxMeshYName = '';
	let maxMeshZName = '';

	/*Loop through each mesh in the TransformNode to find their extents relative to the transferNode*/
	transferNode.getChildMeshes().forEach(mesh => {
		mesh.isVisible = true;
		
		const boundingInfo = mesh.getBoundingInfo();
		const boundingBox = boundingInfo.boundingBox;

		const worldMatrix = mesh.computeWorldMatrix(true);
		const minimumWorld = BABYLON.Vector3.TransformCoordinates(boundingBox.minimum, worldMatrix);
		const maximumWorld = BABYLON.Vector3.TransformCoordinates(boundingBox.maximum, worldMatrix);
		
		if (!(mesh.id.includes("head")))
		{
			if (minimumWorld.x < minX) {
				minX = minimumWorld.x;
				minMeshXName = mesh.id;
			}
			
			if (minimumWorld.z < minZ) {
				minZ = minimumWorld.z;
				minMeshZName = mesh.id;
			}
			
			if (maximumWorld.x > maxX) {
				maxX = maximumWorld.x;
				maxMeshXName = mesh.id;
			}
			
			if (maximumWorld.z > maxZ) {
				maxZ = maximumWorld.z;
				maxMeshZName = mesh.id;
			}
		}
		
		if (maximumWorld.y > maxY) {
			maxY = maximumWorld.y;
			maxMeshYName = mesh.id;
		}
		
		if (minimumWorld.y < minY) {
			minY = minimumWorld.y;
			minMeshYName = mesh.id;
		}
	});
	
	
	if ((transferNode.id === "groupMachine") || (transferNode.id === "groupAll"))
	{
		var gripperBlock1Z	= scene.getMeshById("(SBS) gripper block 1").position.z;
		var gripperBodyZ	= scene.getMeshById("(SBS) gripper body").position.z;
		var diffZ			= Math.abs(gripperBlock1Z - gripperBodyZ) + 0.3;
		minZ				= -diffZ;
		
		var gripperBlock3Z	= scene.getMeshById("(SBS) gripper block 3").position.z;
		diffZ				= Math.abs(gripperBlock3Z - gripperBodyZ) + 0.3;
		maxZ				= diffZ;
		
		var gripperBlock2X	= scene.getMeshById("(SBS) gripper block 2").position.x;
		var gripperBodyX	= scene.getMeshById("(SBS) gripper body").position.x;
		var diffX			= Math.abs(gripperBlock2X - gripperBodyX) + 0.3;
		minX				= -diffX;
		
		var gripperBlock4X	= scene.getMeshById("(SBS) gripper block 4").position.x;
		diffX				= Math.abs(gripperBlock4X - gripperBodyX) + 0.3;
		maxX				= diffX;
	}
	else if (transferNode.id === "groupCutterHead")
	{
		maxY 				= maxY + 1.35;
		minX				= -2.07;
		maxX				= 2.07;
		minZ				= -2.07;
		maxZ				= 2.07;
	}
	else
	{
		minX				= -2.07;
		maxX				= 2.07;
		minZ				= -2.07;
		maxZ				= 2.07;
	}
	
	/*Define the dimensions of the bounding box*/
	const boxWidth = maxX - minX;
	const boxHeight = maxY - minY;
	const boxDepth = maxZ - minZ;

	/*Calculate the center of the bounding box*/
	const centerX = minX + boxWidth / 2;
	const centerY = minY + boxHeight / 2;
	const centerZ = minZ + boxDepth / 2;
}

/*Hide group*/
function SBS_HideGroup(transferNode) 
{
	var childMeshes = transferNode.getChildMeshes();

	if (childMeshes !== null) 
	{
		childMeshes.forEach(function(mesh) 
		{
			mesh.isVisible = false;
		});
	}
}

/*Change box boundaries*/
function SBS_UpdateBox() 
{
	switch (showGroup)
	{
		case 1:	
				SBS_HideGroup(groupAll);
				SBS_CalcGroup(groupAll);
				break;
		case 2:	
				SBS_HideGroup(groupStages);
				SBS_ShowGroup(groupStages);
				break;
		case 3:	
				SBS_HideGroup(groupMachine);
				SBS_ShowGroup(groupMachine);
				break;
		case 4:	
				SBS_HideGroup(groupStroke);
				SBS_ShowGroup(groupStroke);
				break;
		case 5:	
				SBS_HideGroup(groupCutterHead);
				SBS_ShowGroup(groupCutterHead);
				break;
	}
}

/*Toggle View button*/
function SBS_ToggleView()
{
	var btn 				= document.getElementById('extra-button');
	var block 				= document.getElementById('block_tr2');
	
	if ((btn.style.background === "grey") || (btn.style.background === ""))
	{
		btn.style.background	= "#bada55";
		block.style.display 	= "block";
	}
	else
	{
		btn.style.background 	= "grey";
		block.style.display 	= "none";
	}
}

/*Path button*/
function SBS_Path_Button()
{
	var btn 				= document.getElementById('path-button');
	var block 				= document.getElementById('block_tr2');
	
	if ((btn.style.background === "grey") || (btn.style.background === ""))
	{
		btn.style.background	= "#bada55";
		SBS_Path(1);
	}
	else
	{
		btn.style.background 	= "grey";
		SBS_Path(0);
	}
}
	
/*Decide which group to show*/
function SBS_Group_Select(Element)
{
	var btnAll 						= document.getElementById('sbs-all-button'); 
	var btnStages 					= document.getElementById('stages-button'); 
	var btnMachine 					= document.getElementById('machine-button'); 
	var btnStroke					= document.getElementById('stroke-button'); 
	var btnCutterHead				= document.getElementById('cutterhead-button'); 
	
	btnAll.style.background			= "grey";
	btnStages.style.background		= "grey";
	btnMachine.style.background		= "grey";
	btnStroke.style.background		= "grey";
	btnCutterHead.style.background	= "grey";
	
	SBS_HideGroup(groupAll);
									
	switch (Element.id)
	{
		case "all-button":			btnAll.style.background			= "#bada55";
									SBS_ShowGroup(groupAll);
									showGroup 						= 1;
									break;
		case "stages-button":		btnStages.style.background		= "#bada55";
									SBS_ShowGroup(groupStages);
									showGroup 						= 2;
									break;
		case "machine-button":		btnMachine.style.background		= "#bada55";
									SBS_ShowGroup(groupMachine);
									showGroup 						= 3;
									break;	
		case "stroke-button":		btnStroke.style.background		= "#bada55";
									SBS_ShowGroup(groupStroke);
									showGroup 						= 4;
									break;	
		case "cutterhead-button":	btnCutterHead.style.background	= "#bada55";
									SBS_ShowGroup(groupCutterHead);
									showGroup 						= 5;
									break;				
	}
}

/*Function to create tick marks*/
function SBS_CreateTickMarks(axis, direction, length, step) 
{
    const sign 			= direction.normalize();
	const count			= length/step;
	
    for (let i = 1; i <= count; i++) 
	{
		
        const position 		= sign.scale(step * i);
        const tick 			= BABYLON.MeshBuilder.CreateBox(`tick${i}`, { size: 0.1 }, scene);
        tick.position 		= position;
        tick.parent 		= axis;
		
		var tickMat 		= new BABYLON.StandardMaterial("transparentMaterial", scene);
		tickMat.alpha 		= 1;
	
		tick.material		= tickMat;
    }
}

/*Move stages down*/
function SBS_Stages()
{
	extendStages 			+= 0.3*fastForward;
	if (slack <= 0)
	{
		extendStages			= 0;
		simState 				= 0;
				
		if (fastForwardFlag)
		{
			SBS_FastForward(false);
		}
	}
	else
	{	
		if (slack <= 0.003*fastForward)
		{
			groupStages.position.y 	-= slack;
		}
		else
		{
			groupStages.position.y 	-= 0.003*fastForward;
		}
		
		var stagesTopText		= document.getElementById("stages-top-text");
		stagesTopText.innerHTML	= (Math.round(-1000*(groupStages.position.y + 43.4))/1000).toFixed(3)+"m";
		
		var stagesBotText		= document.getElementById("stages-bottom-text");
		stagesBotText.innerHTML	= (Math.round(-1000*(groupStages.position.y + 14.3))/1000).toFixed(3)+"m";
				
		var slackText			= document.getElementById("slack-dist-text");
		slack					= Math.round(Math.abs(groupStages.position.y - groupMachine.position.y + 1.5)*1000)/1000;
		slackText.innerHTML		= slack.toFixed(3)+"m";
	}
}

/*Make a simulation going down*/
function SBS_Simulation()
{
	switch (simState)
	{
		case 0:		SBS_Thrust();
					modeText.innerHTML 	= "<b>Drilling</b>";
					break;
		case 1:		SBS_Grip();	
					modeText.innerHTML 	= "<b>Ungripping</b>";
					break;	
		case 2:		SBS_Retract();
					modeText.innerHTML 	= "<b>Retracting</b>";	
					break;	
		case 3:		SBS_Grip();	
					modeText.innerHTML 	= "<b>Gripping</b>";
					break;	
		case 4:		SBS_Stages();	
					modeText.innerHTML 	= "<b>Lowering</b>";	
					break;						
	}
	
	SBS_Bunkers();
}

/*Make a simulation going down*/
function SBS_FastForward(popup)
{
	if (popup)
	{
		fastForwardFlag 	= true;
		var fastForwardTemp;
		
		switch (fastForward)
		{
			case 1:		fastForwardTemp = 2;
						break;	
			case 2:		fastForwardTemp = 5;	
						break;	
			case 5:		fastForwardTemp = 10;
						break;	
			case 10:	fastForwardTemp = 1;
						break;						
		}
		
		Swal.fire(
		{
			title: 				'Fastforward Loading...',
			text: 				fastForward+'X >>> '+fastForwardTemp+'X',
			icon: 				'info',
			timer: 				1000,
			showConfirmButton: 	false,
			willClose: () => {}
		});
	}
	else
	{
		switch (fastForward)
		{
			case 1:		fastForward = 2;
						break;	
			case 2:		fastForward = 5;	
						break;	
			case 5:		fastForward = 10;
						break;	
			case 10:	fastForward = 1;
						break;						
		}
		
		fastForwardFlag		= false;
	}
}

/*Replay data*/
function SBS_Replay()
{
	var btn 				= document.getElementById('extra2-button');
	var block 				= document.getElementById('block_br2');
	
	if ((btn.style.background === "grey") || (btn.style.background === ""))
	{
		btn.style.background	= "#bada55";
		block.style.display 	= "block";
	}
	else
	{
		btn.style.background 	= "grey";
		block.style.display 	= "none";
	}
	
	ReplayDataRequest();
}
