var plcData 			= {};
var plcErrors 			= {};
var plcInfo				= [];

/*Used to replay logged data*/
var RCReplayDataNow		= {};
var RCReplayDataAll		= {};
var RCReplayDeltas		= {};
var RCReplayElapsed		= {};
var RCReplayIndex		= 0;
var RCReplayIndexNow	= 0;

/*Pivot positions of cylinders*/
let pivotCylTL;
let pivotCylTR;
let pivotCylBL;
let pivotCylBR;

var oldValues			= [0,0,0,0,0,0];
var eStop 				= false;

var oldTons				= new Array(12).fill(-1);

var errorList			= [];
var warningList			= [];
var errorListInfo		= [];
var warningListInfo		= [];
var flicker				= false;

var displayInfo			= false;

var pathLeft			= [];
var pathFront			= [];
var pathRight			= [];
var pathBack			= [];
var pathGroup			= [];
var pathPivot			= [];

var reefLeft			= [];
var reefFront			= [];
var reefRight			= [];
var reefBack			= [];
var reefGroup			= [];
var reefPivot			= [];

let pathSemiMat;
let reefSemiMat;
let pivotMat;

var errorsLoaded		= false;

let toggleView 			= 0;
	
/*Group used to move the all parts*/
var groupAll;
var assnAll			= false;
var showAll			= false;

/*Groups*/
let groupThrustCyls;
let groupStabs;
let groupGrippers;
let groupCutters;
let groupCuttingHead;
let groupThrustBody;
let groupCylTL;
let groupCylTR;
let groupCylBL;
let groupCylBR;

/*Show or hide path*/
var showPath		= false;

/*Ground material used for path*/
var groundMaterial;

/*Used for hole tracing with the SLAM data*/
var	holePath 				=  [[0,0,0,	"2023/12/07","10:34:15'00"],
								[0,0,10,"2023/12/07","10:34:16'00"],
								[0,0,20,"2023/12/07","10:34:17'00"],
								[0,1,30,"2023/12/07","10:34:18'00"],
								[1,1,40,"2023/12/07","10:34:19'00"],
								[1,2,50,"2023/12/07","10:34:20'00"],
								[3,2,60,"2023/12/07","10:34:21'00"],
								[3,2,70,"2023/12/07","10:34:22'00"],
								[3,2,80,"2023/12/07","10:34:23'00"],
								[3,3,90,"2023/12/07","10:34:24'00"]];
					
var Dots 					= [];
var Lines 					= [];

/*Initialise the model*/
function ReefCutter_Init()
{
	groupAll 					= new BABYLON.TransformNode("groupAll", 		scene);
	groupThrustCyls 			= new BABYLON.TransformNode("groupThrustCyls", 	scene);
	groupStabs 					= new BABYLON.TransformNode("groupStabs", 		scene);
	groupGrippers 				= new BABYLON.TransformNode("groupGrippers", 	scene);
	groupCutters 				= new BABYLON.TransformNode("groupCutters", 	scene);
	groupCuttingHead 			= new BABYLON.TransformNode("groupCuttingHead", scene);
	groupThrustBody 			= new BABYLON.TransformNode("groupThrustBody", 	scene);
	groupCylTL 					= new BABYLON.TransformNode("groupCylTL", 		scene);
	groupCylTR 					= new BABYLON.TransformNode("groupCylTR",	 	scene);
	groupCylBL 					= new BABYLON.TransformNode("groupCylBL", 		scene);
	groupCylBR 					= new BABYLON.TransformNode("groupCylBR", 		scene);
	
	pivotCylTL					= BABYLON.MeshBuilder.CreateBox("pivotCylTL", {size: 0.1}, scene);
	pivotCylTL.material 		= pivotMat;
	
	pivotCylTR					= BABYLON.MeshBuilder.CreateBox("pivotCylTR", {size: 0.1}, scene);
	pivotCylTR.material 		= pivotMat;
	
	pivotCylBL					= BABYLON.MeshBuilder.CreateBox("pivotCylBL", {size: 0.1}, scene);
	pivotCylBL.material 		= pivotMat;
	
	pivotCylBR					= BABYLON.MeshBuilder.CreateBox("pivotCylBR", {size: 0.1}, scene);
	pivotCylBR.material 		= pivotMat;

	if (Operator)
	{
		var inject 		=
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
	
	document.getElementById("block_tr_menu-text").innerHTML = "Top Steering";
	document.getElementById("block_br_menu-text").innerHTML = "Front Steering";
	document.getElementById("block_tl_menu-text").innerHTML = "Left Steering";
	document.getElementById("block_bl_menu-text").innerHTML = "Information";
	document.getElementById("extra-text").innerHTML 		= "Reef (Demo)";

	document.getElementById('block_tl').innerHTML 			= 		
			"<img 	id='leftMikkerPos' 			class='MikkerPos' 					src='./css/mikkerPosWhite.png' alt=''>"+
			"<img 	id='leftViewPos' 			class='ViewPos' 					src='./css/leftViewPos.png' alt=''>"+
			"<img 	id='leftMikkerRot' 			class='MikkerRot' 					src='./css/mikkerRotWhite.png' alt=''>"+
			"<img 	id='leftViewRot' 			class='ViewRot' 					src='./css/leftViewRot.png' alt=''>"+
			"<img 	id='leftMikkerLine' 		class='MikkerRotLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='leftMikkerLineHor' 		class='MikkerPosLineFlip' 			src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='leftMikkerLineVer' 		class='MikkerPosLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<p 	id='leftPosY' 				class='Pos1'>Y Position: 0m</p>"+
			"<p 	id='leftPosZ' 				class='Pos2'>Z Position: 0m</p>"+
			"<p 	id='leftRot' 				class='Rot'>X Rotation: 0°</p>"+
			"<p 	id='leftPosLabel' 			class='PosLabel'>Y</p>"+
			"<p 	id='leftPosLabelFlip' 		class='PosLabelFlip'>Z</p>"+
			"<p 	id='leftRotLabel' 			class='RotLabel'>∠X</p>";
				
	document.getElementById('block_br').innerHTML 			= 	
			"<img 	id='frontMikkerPos' 		class='MikkerPos' 					src='./css/mikkerPosWhite.png' alt=''>"+
			"<img 	id='frontViewPos' 			class='ViewPos' 					src='./css/frontViewPos.png' alt=''>"+
			"<img 	id='frontMikkerRot' 		class='MikkerRot' 					src='./css/mikkerRotWhite.png' alt=''>"+
			"<img 	id='frontViewRot' 			class='ViewRot' 					src='./css/frontViewRot.png' alt=''>"+
			"<img 	id='frontMikkerLine' 		class='MikkerRotLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='frontMikkerLineHor' 	class='MikkerPosLineFlip' 			src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='frontMikkerLineVer' 	class='MikkerPosLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<p 	id='frontPosX' 				class='Pos1'>X Position: 0m</p>"+
			"<p 	id='frontPosY' 				class='Pos2'>Y Position: 0m</p>"+
			"<p 	id='frontRot' 				class='Rot'>Z Rotation: 0°</p>"+
			"<p 	id='frontPosLabel' 			class='PosLabel'>X</p>"+
			"<p 	id='frontPosLabelFlip' 		class='PosLabelFlip'>Y</p>"+
			"<p 	id='frontRotLabel' 			class='RotLabel'>∠Z</p>";
		
	document.getElementById('block_tr').innerHTML 			= 
			"<img 	id='topMikkerPos' 			class='MikkerPos' 					src='./css/mikkerPosWhite.png' alt=''>"+
			"<img 	id='topViewPos' 			class='ViewPos' 					src='./css/topViewPos.png' alt=''>"+
			"<img 	id='topMikkerRot' 			class='MikkerRot' 					src='./css/mikkerRotWhite.png' alt=''>"+
			"<img 	id='topViewRot' 			class='ViewRot' 					src='./css/topViewRot.png' alt=''>"+
			"<img 	id='topMikkerLine' 			class='MikkerRotLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='topMikkerLineHor' 		class='MikkerPosLineFlip' 			src='./css/mikkerLineWhite.png' alt=''>"+
			"<img 	id='topMikkerLineVer' 		class='MikkerPosLine' 				src='./css/mikkerLineWhite.png' alt=''>"+
			"<p 	id='topPosX' 				class='Pos1'>X Position: 0m</p>"+
			"<p 	id='topPosZ' 				class='Pos2'>Z Position: 0m</p>"+
			"<p 	id='topRot' 				class='Rot'>Y Rotation: 0°</p>"+
			"<p 	id='topPosLabel' 			class='PosLabel'>X</p>"+
			"<p 	id='topPosLabelFlip' 		class='PosLabelFlip'>Z</p>"+
			"<p 	id='topRotLabel' 			class='RotLabel'>∠Y</p>";
	
	document.getElementById('block_bl').innerHTML 			= 
			"<div id='sheetGeneral' class='sheet' style='display:block; overflow: auto;'>"+
			"<table style='position: relative; width:80%; left: 15%;'>"+
			"	<colgroup>"+
			"		 <col width='75%'>"+
			"		 <col width='25%'>"+
			"	</colgroup>"+
			"	<tr><td id='Feed-Rate Title'>Thrust Feedrate (AVG):						</td><td id='Feed-Rate Value'>?</td></tr>"+
			"	<tr><td id='Avg Thrust Cylinder Tons Title'>Thrust Tons (AVG):			</td><td id='Avg Thrust Cylinder Tons Value'>?</td></tr>"+
			"	<tr><td id='AvgThrustCylPos Title'>Thrust Pos (AVG):					</td><td id='AvgThrustCylPos Value'>?</td></tr>"+
			"	<tr><td id='AvgCutterRPM Title'>Cutter RPM (AVG):						</td><td id='AvgCutterRPM Value'>?</td></tr>"+
			"	<tr><td id='Supply Line Flow Pressure PT5 Title'>System Pressure:		</td><td id='Supply Line Flow Pressure PT5 Value'>?</td></tr>"+
			"	<tr><td id='Vacuum Pressure After Filters Title'>Vacuum Pressure:		</td><td id='Vacuum Pressure After Filters Value'>?</td></tr>"+
			"	<tr><td id='Display Pump Tank Temperature TT1 Title'>Tank Temperature:	</td><td id='Display Pump Tank Temperature TT1 Value'>?</td></tr>"+
			"	<tr><td id='Display Pump Tank Level LT1 Title'>Tank Level:				</td><td id='Display Pump Tank Level LT1 Value'>?</td></tr>"+
			"</table>"+
			"</div>"+
			"<div id='sheetThrust' class='sheet'>"+
			"	<img 					class='thrustPic' 	src='./css/thrust160.png' 		alt=''>"+
			"	<img 					class='thrustPic' 	src='./css/thrust160.png' 		alt=''>"+
			"	<img 					class='thrustPic' 	src='./css/thrust190.png' 		alt=''>"+
			"	<img 					class='thrustPic' 	src='./css/thrust190.png' 		alt=''>"+
			"	<img id='thrustBack' 	class='smallBack' 	src='./css/HMI_Background.jpg' 	alt=''>"+
			"	<table 	class='smallTableThrust'>"+
			"		<colgroup>"+
			"			 <col width='60%'>"+
			"			 <col width='20%'>"+
			"			 <col width='20%'>"+
			"		</colgroup>"+
			"		<tr><td><b>Cylinder</b>							</td>	<td><b>Tons</b></td>								<td><b>Pos</b></td></tr>"+
			"		<tr><td id='rThrustPress_TL Title'>Top Left:	</td>	<td id='Thrust Pressure Top Left Value'>?</td>		<td id='Thrust Position Top Left Value'>?</td></tr>"+
			"		<tr><td id='rThrustPress_TR Title'>Top Right:	</td>	<td id='Thrust Pressure Top Right Value'>?</td>		<td id='Thrust Position Top Right Value'>?</td></tr>"+
			"		<tr><td id='rThrustPress_BL Title'>Bottom Left:	</td>	<td id='Thrust Pressure Bottom Left Value'>?</td>	<td id='Thrust Position Bottom Left Value'>?</td></tr>"+
			"		<tr><td id='rThrustPress_BR Title'>Bottom Right:</td>	<td id='Thrust Pressure Bottom Right Value'>?</td>	<td id='Thrust Position Bottom Right Value'>?</td></tr>"+
			"	</table>"+
			"</div>"+
			"<div id='sheetStabil' class='sheet'>"+
			"	<img 					class='stabilPic' 	src='./css/stabilizer.png' 		alt=''>"+
			"	<img 					class='stabilPic' 	src='./css/stabilizer.png' 		alt=''>"+
			"	<img 					class='stabilPic' 	src='./css/stabilizer.png' 		alt=''>"+
			"	<img 					class='stabilPic' 	src='./css/stabilizer.png' 		alt=''>"+
			"	<img id='stabilBack' 	class='smallBack' 	src='./css/HMI_Background.jpg' 	alt=''>"+
			"	<table 	class='smallTable'>"+
			"		<colgroup>"+
			"			 <col width='75%'>"+
			"			 <col width='25%'>"+
			"		</colgroup>"+
			"		<tr><td><b>Stabilizer</b>											</td>	<td><b>Tons</b></td></tr>"+
			"		<tr><td id='Stabilizers Pressure Top Left Title'>Top Left:			</td>	<td id='Stabilizers Pressure Top Left Value'>?</td></tr>"+
			"		<tr><td id='Stabilizers Pressure Top Right Title'>Top Right:		</td>	<td id='Stabilizers Pressure Top Right Value'>?</td></tr>"+
			"		<tr><td id='Stabilizers Pressure Side Left Title'>Bottom Left:		</td>	<td id='Stabilizers Pressure Side Left Value'>?</td'></tr>"+
			"		<tr><td id='Stabilizers Pressure Side Right Title'>Bottom Right:	</td>	<td id='Stabilizers Pressure Side Right Value'>?</td></tr>"+
			"	</table>"+
			"</div>"+
			"<div id='sheetGripper' class='sheet'>"+
			"	<img 					class='gripperPic' 	src='./css/Gripper.png' 		alt=''>"+
			"	<img 					class='gripperPic' 	src='./css/Gripper.png' 		alt=''>"+
			"	<img id='gripperBack' 	class='smallBack' 	src='./css/HMI_Background.jpg' 	alt=''>"+
			"	<table 	class='smallTableGrip'>"+
			"		<colgroup>"+
			"			 <col width='50%'>"+
			"			 <col width='25%'>"+
			"		</colgroup>"+
			"		<tr><td><b>Gripper</b>											</td>	<td><b>Tons</b></td></tr>"+
			"		<tr><td id='Gripper Cylinder PressureA Left Title'>A Left:		</td>	<td id='Gripper Cylinder PressureA Left Value'>?</td></tr>"+
			"		<tr><td id='Gripper Cylinder PressureB Left Title'>B Left:		</td>	<td id='Gripper Cylinder PressureB Left Value'>?</td></tr>"+
			"		<tr><td id='Gripper Cylinder PressureA Right Title'>A Right:	</td>	<td id='Gripper Cylinder PressureA Right Value'>?</td></tr>"+
			"		<tr><td id='Gripper Cylinder PressureB Right Title'>B Right:	</td>	<td id='Gripper Cylinder PressureB Right Value'>?</td></tr>"+
			"	</table>"+
			"</div>"+
			"<div id='sheetCutter' class='sheet'>"+
			"	<div id='cutterPicDiv' class='cutterPicDiv'>"+
			"		<img 					class='cutterPic' 		src='./css/Cutter.png' 			alt=''>"+
			"		<img 					class='cutterPic' 		src='./css/Cutter.png' 			alt=''>"+
			"		<img 					class='cutterPic' 		src='./css/Cutter.png' 			alt=''>"+
			"		<img 					class='cutterPic' 		src='./css/Cutter.png' 			alt=''>"+
			"		<img id='cutterBack' 	class='smallBack' 		src='./css/HMI_Background.jpg' 	alt=''>"+
			"	</div>"+
			"	<table 	class='smallTable'>"+
			"		<colgroup>"+
			"			 <col width='75%'>"+
			"			 <col width='25%'>"+
			"		</colgroup>"+
			"		<tr><td><b>Cutter</b>								</td>	<td><b>RPM</b></td></tr>"+
			"		<tr><td id='Cutter RPM Top Left Title'>A Left:		</td>	<td id='Cutter RPM Top Left Value'>?</td></tr>"+
			"		<tr><td id='Cutter RPM Top Right Title'>B Left:		</td>	<td id='Cutter RPM Top Right Value'>?</td></tr>"+
			"		<tr><td id='Cutter RPM Bottom Left Title'>A Right:	</td>	<td id='Cutter RPM Bottom Left Value'>?</td></tr>"+
			"		<tr><td id='Cutter RPM Bottom Right Title'>B Right:	</td>	<td id='Cutter RPM Bottom Right Value'>?</td></tr>"+
			"	</table>"+
			"</div>"+
			"<div id='page-buttons'>"+
			"	<button id='btnGeneral'	class='page-button' style='background: #bada55;' 	onmouseup='ReefCutter_Information_ShowHide(0)'>General</button>"+
			"	<button id='btnThrust'	class='page-button' 								onmouseup='ReefCutter_Information_ShowHide(1)'>Thrust Cylinders</button>"+
			"	<button id='btnStabil'	class='page-button' 								onmouseup='ReefCutter_Information_ShowHide(2)'>Stabilizers</button>"+
			"	<button id='btnGripper'	class='page-button' 								onmouseup='ReefCutter_Information_ShowHide(3)'>Grippers</button>"+
			"	<button id='btnCutter'	class='page-button' 								onmouseup='ReefCutter_Information_ShowHide(4)'>Cutters</button>"+
			"</div>";
			
	document.getElementById('block_tr2').innerHTML 			= 	
			"<div id='path' class='rf-path'>"+
			"	<div id='path-text' class='rf-path-child'>"+
			"		Path"+
			"	</div>"+
			"	<button id='path-button' class='rf-path-button' onmouseup='ReefCutter_Path_Button();' type='button'></button>"+
			"</div>"+
			"<div id='line-top' 	class='rf-line-top'></div>"+
			"<div id='line-text' 	class='rf-line-child'></div>"+
			"<div id='line-bottom' 	class='rf-line-bottom'></div>"+
			"<div id='rf-all' class='rf-all'>"+
			"	<div id='rf-all-text' class='rf-all-child'>"+
			"		All"+
			"	</div>"+
			"	<button id='rf-all-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='thrustbody' class='rf-all'>"+
			"	<div id='thrustbody-text' class='rf-all-child'>"+
			"		Thrust Body"+
			"	</div>"+
			"	<button id='thrustbody-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='cuttinghead' class='rf-all'>"+
			"	<div id='cuttinghead-text' class='rf-all-child'>"+
			"		Cutting Head"+
			"	</div>"+
			"	<button id='cuttinghead-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='cutters' class='rf-all'>"+
			"	<div id='cutters-text' class='rf-all-child'>"+
			"		Cutters"+
			"	</div>"+
			"	<button id='cutters-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='thrustcylinders' class='rf-all'>"+
			"	<div id='thrustcylinders-text' class='rf-all-child'>"+
			"		Cylinders"+
			"	</div>"+
			"	<button id='thrustcylinders-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='stabilizers' class='rf-all'>"+
			"	<div id='stabilizers-text' class='rf-all-child'>"+
			"		Stabilizers"+
			"	</div>"+
			"	<button id='stabilizers-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>"+
			"<div id='grippers' class='rf-all'>"+
			"	<div id='grippers-text' class='rf-all-child'>"+
			"		Grippers"+
			"	</div>"+
			"	<button id='grippers-button' class='rf-all-button' onmouseup='ReefCutter_Group_Select(this);' type='button'></button>"+
			"</div>";		
			
	groundMaterial 					= new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.alpha 			= 0.5;
	groundMaterial.diffuseColor 	= new BABYLON.Color3(0.6, 0.3, 0); // Brown color
	groundMaterial.albedoColor 		= new BABYLON.Color3(0.6, 0.3, 0);
	groundMaterial.backwardCulling	= false;
			
	var btnAll 					= document.getElementById('rf-all-button'); 
	btnAll.style.background		= "#bada55";
			
	document.getElementById('slowest-button').style.background 	= "grey";
	document.getElementById('slower-button').style.background 	= "grey";
	document.getElementById('play-button').style.background 	= "grey";
	document.getElementById('faster-button').style.background 	= "grey";
	document.getElementById('fastest-button').style.background 	= "grey";
	
	var text 					= document.getElementById('extra-text');
	text.innerHTML 				= "Groups";
	
	text 						= document.getElementById('extra2-text');
	text.innerHTML 				= "Replay";

	pathSemiMat 				= new BABYLON.StandardMaterial("pathSemiMat", scene);
	reefSemiMat 				= new BABYLON.StandardMaterial("reefSemiMat", scene);
	pivotMat					= new BABYLON.StandardMaterial("pivotMat", scene);

	pathSemiMat.alpha 			= 0.5;
	reefSemiMat.alpha 			= 0.5;
	reefSemiMat.diffuseColor	= new BABYLON.Color3.FromHexString("#FFD700");
	pivotMat.alpha				= 0;
	
	LoadModelRequest();
}

/*All model functions to be performed before rendering*/
function ReefCutter_PreRender()
{
	ReefCutter_ErrorHandler();
	
	if (typeof groupCylBR !== 'undefined')
	{
		var indexTL 			= newModelNames.indexOf("(ReefCutter) rbs-tc-160-ca-00 l bar");
		var indexTR 			= newModelNames.indexOf("(ReefCutter) rbs-tc-160-ca-00 r bar");
		var indexBL 			= newModelNames.indexOf("(ReefCutter) rbs-tc-190-ca-00 l bar");
		var indexBR 			= newModelNames.indexOf("(ReefCutter) rbs-tc-190-ca-00 r bar");
		
		if ((((indexTL > -1) && (indexTR > -1)) && ((indexBL > -1) && (indexBR > -1))) && (!groupCylBR.parent))
		{
			pivotCylTL.position		= new BABYLON.Vector3(loadPositions[indexTL][0],loadPositions[indexTL][1],loadPositions[indexTL][2]);
			pivotCylTR.position		= new BABYLON.Vector3(loadPositions[indexTR][0],loadPositions[indexTR][1],loadPositions[indexTR][2]);
			pivotCylBL.position		= new BABYLON.Vector3(loadPositions[indexBR][0],loadPositions[indexTR][1],loadPositions[indexBR][2]);
			pivotCylBR.position		= new BABYLON.Vector3(loadPositions[indexBL][0],loadPositions[indexTL][1],loadPositions[indexBL][2]);

			/*Assign all groups*/
			if (!assnAll)
			{
				ReefCutter_Groups();
			}
	
			var yDiffPos 				= loadPositions[indexTR][1] - loadPositions[indexBR][1];
			
			/*for (i = 0; i < newModelNames.length; i++)
			{
				if (newModelGroup[i] === "CylTL")
				{
					scene.getMeshById(newModelNames[i]).parent = groupCylTL;
				}
				else if (newModelGroup[i] === "CylTR")
				{
					scene.getMeshById(newModelNames[i]).parent = groupCylTR;
				}
				else if (newModelGroup[i] === "CylBL")
				{
					scene.getMeshById(newModelNames[i]).parent = groupCylBL;
				}
				else if (newModelGroup[i] === "CylBR")
				{
					scene.getMeshById(newModelNames[i]).parent = groupCylBR;
				}
			}*/	
			
			var rodTL				= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 l rod");
			var rodTR				= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 r rod");
			var rodBL				= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 l rod");
			var rodBR				= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 r rod");
			
			var barTL				= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 l bar");
			var barTR				= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 r bar");
			var barBL				= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 l bar");
			var barBR				= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 r bar");
			
			barTL.position			= new BABYLON.Vector3.Zero();
			barTR.position			= new BABYLON.Vector3.Zero();
			barBL.position			= new BABYLON.Vector3(0,-yDiffPos,0);
			barBR.position			= new BABYLON.Vector3(0,-yDiffPos,0);
			
			rodTL.position			= new BABYLON.Vector3(0,0.11,0);
			rodTR.position			= new BABYLON.Vector3(0,0.11,0);
			rodBL.position			= new BABYLON.Vector3(0,0.11,0);
			rodBR.position			= new BABYLON.Vector3(0,0.11,0);
		}
	}
	
	if (!eStop)
	{
		if (replaying)
		{	
			if (replayForward)
			{
				RCReplayElapsed 								   += scene.getEngine().getDeltaTime()*replaySpeed;
				
				if (RCReplayElapsed >= maxDelta)
				{
					RCReplayIndex 									   	= RCReplayDeltas.indexOf(minDelta);
					RCReplayElapsed										= minDelta;
					replayRestart										= true;
				}
				else if (RCReplayElapsed >= RCReplayDeltas[RCReplayIndex])
				{
					RCReplayIndex 									   += 1;
					RCReplayDataNow										= RCReplayDataAll[RCReplayIndex + 1];
				}
			}
			else
			{
				RCReplayElapsed 									-= scene.getEngine().getDeltaTime()*replaySpeed;
				
				if (RCReplayElapsed <= minDelta)
				{
					RCReplayIndex 									   	= RCReplayDeltas.indexOf(maxDelta);
					RCReplayElapsed										= maxDelta;
					replayRestart										= true;
				}
				else if (RCReplayElapsed <= RCReplayDeltas[RCReplayIndex])
				{
					RCReplayIndex 									   -= 1;
					RCReplayDataNow										= RCReplayDataAll[RCReplayIndex + 1];
				} 
			}
			
			if (RCReplayIndexNow != RCReplayIndex)
			{
				for (i = 2; i < RCReplayDataNow.length; i++)
				{
					if (i === 91)
					{
						RCReplayDataNow[i]	= (Math.round(RCReplayDataNow[i]*1000))/1000;
					}
					else
					{
						RCReplayDataNow[i]	= (Math.round(RCReplayDataNow[i]*20))/1000;
						
						if ((i >= 101) && (i <= 103))
						{
							RCReplayDataNow[i]	= (Math.round(RCReplayDataNow[i] - 100)*1000)/1000;
						}
						
						if ((i >= 104) && (i <= 108))
						{
							RCReplayDataNow[i]	= (Math.round(RCReplayDataNow[i] - 180)*1000)/1000;
						}
					}
				}	
				
				RCReplayIndexNow 	= RCReplayIndex;
			}
			
			outputCurrent.innerHTML								= RCReplayDataAll[RCReplayIndex + 1][1];
			rangeCurrent.style.left 							= RCReplayElapsed/RCReplayDeltas[RCReplayDeltas.length - 1]*100+'%';
		}
			
		ReefCutter_RotateCutter();		
		ReefCutter_SG_Extension();
		ReefCutter_FrontBody_Pos_Rot();
		ReefCutter_Tonner();
	}
}

/*Handle the model data*/
function ReefCutter_Data(Data)
{
	if (!replaying)
	{
		plcData		= Data;
		
		Object.keys(plcData).forEach(Data =>
		{
			if (plcData[Data].name === "Cutting Head Torque")
			{
				plcData[Data].value		= (Math.round(plcData[Data].value*50000))/1000;
			}
			else
			{
				plcData[Data].value		= (Math.round(plcData[Data].value*1000))/1000;
				
				if (plcData[Data].name.indexOf("Roll") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 180)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Tilt") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 180)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Body A") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 180)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Body X") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 500)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Body Y") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 500)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Body Z") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 500)*1000))/1000;
				}
				else if (plcData[Data].name.indexOf("Original") > -1)
				{
					plcData[Data].value		= (Math.round((plcData[Data].value - 500)*1000))/1000;
				}
			}
		});
	
		ReefCutter_Table();
	}
}

/*Handle the model errors and warnings*/
function ReefCutter_Errors(Errors)
{
	if (!replaying)
	{
		plcErrors 		= Errors;
		eStop 			= false;
		
		ReefCutter_Table();
		
		Object.keys(plcErrors).forEach(Error =>
		{
			if ((plcErrors[Error].value === 1) && (plcErrors[Error].lookup === -1))
			{
				eStop = true;
			}
		});
		
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
									if ((lookup === errorLookup[k]) && (lookup !== "0"))
									{
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
			LoadModelInfoRequest();
			displayInfo = true;
		}	
		
		errorsLoaded		= true;
	}
}

/*Change the model table values*/
function ReefCutter_Table()
{
	var table			= document.getElementById("sensorTable");
	var inject 			= 	"<colgroup>"+
							"	 <col width='85%'>"+
							"	 <col width='15%'>"+
							"</colgroup>";
	var groupNames 		= ["General","Cutting Head","Cutters","Plundger","Stabilizers","Thrust Cylinders","Grippers","Vacuum Pack","Hydraulic Pack","Thrust Body"];	
	
	/*Numbers are for qnique values not for ignores*/					
	var dataKeys		= Object.keys(plcData);
	
	var dataGroups 		=	[[15,16,17,18,25,77],											//General
							[0,48,49,50,53,54,75,76,87,96,97,98,99,100,101,102,105],		//Cutting Head
							[7,8,43,44,45,46,110,111,112,113],								//Cutters
							[13,14,47],														//Plundger
							[19,20,21,22,23,24,27,28,29,30,82,83,84,85],					//Stabilizers
							[9,10,12,31,32,33,34,35,36,37,38,79,80,81],						//Thrust Cylinders
							[11,39,40,41,42],												//Grippers
							[2,3,6,55,56,57,58,59,60,61,62,63,64,65,67,68,69,70,71,72,73],	//Vacuum Pack
							[1,4,5,66,88,89,94,95],											//Hydraulic Pack
							[51,52,90,91,92,93,103,104]];									//Thrust Body
							
	var errorKeys		= Object.keys(plcErrors);
							
	var errorGroups 	= 	[[0,1,10,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140],
							[2,3,4,5,11,12,13,14,15,16,17,18,19,20,21,22,23,38,39,40,55,56,57],
							[6,7,24,25,41,42],
							[8,10],
							[26,27,28,29,43,44,45,46],
							[30,31,32,33,47,48,49,50],
							[51,52,53,54],
							[58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,142,143],
							[89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117]];
	
	if (dataErrorSelect)
	{
		for (i = 0; i < groupNames.length; i ++)
		{
			inject 			+= "<tr><td colspan='2' style='text-align: center;'><b>"+groupNames[i]+"</b></td></tr>";
			
			for (j = 0; j < dataGroups[i].length; j ++)
			{
				var tempKey 	= dataKeys[dataGroups[i][j]];
				
				inject 	= inject+"<tr><td>"+plcData[tempKey].name+":</td><td>"+plcData[tempKey].value.toFixed(3)+"</td></tr>";
			}
		}
	}
	else
	{
		for (i = 0; i < groupNames.length - 1; i ++)
		{
			inject 			+= "<tr><td colspan='2' style='text-align: center;'><b>"+groupNames[i]+"</b></td></tr>";
			
			for (j = 0; j < errorGroups[i].length; j ++)
			{
				var tempKey 	= errorKeys[errorGroups[i][j]];
				
				inject 	= inject+"<tr><td>"+plcErrors[tempKey].name+":</td><td>"+plcErrors[tempKey].value.toFixed(0)+"</td></tr>";
			}
		}
	}
	
	table.innerHTML = inject;		
}

/*Handle the model part info*/
function ReefCutter_Info(Info)
{
	if ((!modelInit) && (!modelReload))
	{
		var foundIndex 	= false;
		var customHTML 	= '<table style="width: 100%; table-layout: fixed;"><colgroup><col style="width: 75%;"><col style="width: auto;"></colgroup>';
		
		if (eStop)
		{
			customHTML  	= customHTML+'<tr><td><b style="color:#FF0000;"><font size="+2">eStop:</font></b></td><td><b style="color:#FF0000";"><font size="+2">true</font></b></td></tr>';
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
							
							/*1232if (displays[j].indexOf("Rot") > -1)
							{
								value = value+"°";
							}
							else if (displays[j].indexOf("Pos") > -1)
							{
								value = value+"m";
							}*/
							
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
			
			Swal.close();
			
			Swal.fire(
			{
				position: 	'top',	
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

/*Align the axis of a part to global axis*/
function ReefCutter_RotateCutter()
{
	if (replaying)
	{
		var deltaPosTime = scene.getEngine().getDeltaTime()/1000;
		
		var angle_br = 	parseInt(RCReplayDataNow[45])*0.104719755*deltaPosTime*replaySpeed;
		var angle_bl = -parseInt(RCReplayDataNow[46])*0.104719755*deltaPosTime*replaySpeed;
		var angle_tr = -parseInt(RCReplayDataNow[47])*0.104719755*deltaPosTime*replaySpeed;
		var angle_tl = 	parseInt(RCReplayDataNow[48])*0.104719755*deltaPosTime*replaySpeed;
		
		newModel.forEach(Model =>
		{
			var snippet = Model.idname.substring(24,26);
			
			if (snippet === "br")
			{
				var rotY 			= Model.rotation.y;
				Model.rotate(BABYLON.Axis.Z, angle_br, BABYLON.Space.LOCAL);
				Model.rotation.y 	= rotY;
			}
			else if (snippet === "tl")
			{
				Model.rotate(BABYLON.Axis.Z, angle_tl, BABYLON.Space.LOCAL);
			}
			else if (snippet === "tr")
			{
				Model.rotate(BABYLON.Axis.Z, angle_tr, BABYLON.Space.LOCAL);
			}
			else if (snippet === "bl")
			{
				var rotY 			= Model.rotation.y;
				Model.rotate(BABYLON.Axis.Z, angle_bl, BABYLON.Space.LOCAL);
				Model.rotation.y 	= rotY;
			}
		});
	}
	else
	{
		if (typeof plcData['Cutter RPM Bottom Right'] !== 'undefined')
		{
			var deltaPosTime = scene.getEngine().getDeltaTime()/1000;
			
			if (plcData['Cutters Rotate Inward'].value)
			{
				var angle_br = 	plcData['Cutter RPM Bottom Right'].value*0.104719755*deltaPosTime;
				var angle_tl = 	plcData['Cutter RPM Top Left'].value*0.104719755*deltaPosTime;
				var angle_tr = -plcData['Cutter RPM Top Right'].value*0.104719755*deltaPosTime;
				var angle_bl = -plcData['Cutter RPM Bottom Left'].value*0.104719755*deltaPosTime;
			}
			else
			{
				var angle_br = -plcData['Cutter RPM Bottom Right'].value*0.104719755*deltaPosTime;
				var angle_tl = -plcData['Cutter RPM Top Left'].value*0.104719755*deltaPosTime;
				var angle_tr =  plcData['Cutter RPM Top Right'].value*0.104719755*deltaPosTime;
				var angle_bl =  plcData['Cutter RPM Bottom Left'].value*0.104719755*deltaPosTime;
			}
			
			newModel.forEach(Model =>
			{
				var snippet = Model.idname.substring(24,26);
				
				if (snippet === "br")
				{
					var rotY 			= Model.rotation.y;
					Model.rotate(BABYLON.Axis.Z, angle_br, BABYLON.Space.LOCAL);
					Model.rotation.y 	= rotY;
				}
				else if (snippet === "tl")
				{
					Model.rotate(BABYLON.Axis.Z, angle_tl, BABYLON.Space.LOCAL);
				}
				else if (snippet === "tr")
				{
					Model.rotate(BABYLON.Axis.Z, angle_tr, BABYLON.Space.LOCAL);
				}
				else if (snippet === "bl")
				{
					var rotY 			= Model.rotation.y;
					Model.rotate(BABYLON.Axis.Z, angle_bl, BABYLON.Space.LOCAL);
					Model.rotation.y 	= rotY;
				}
			});		
		}
	}
}

/*Change the colors of affected parts*/
function ReefCutter_ErrorHandler()
{
	/* style="width: 25%;">'+value error flicker every 30 frames*/
	if (scene.getFrameId() % 30 === 0) 
	{
		newModelNames.forEach(name =>
		{
			var mesh = scene.getMeshById(name);
		
			if (mesh)
			{
				if (selectedMeshesNames.indexOf(name) > -1)
				{
					mesh.material.diffuseColor 	= new BABYLON.Color3.Green();
					mesh.material.albedoColor 	= new BABYLON.Color3.Green();
				}
				else if (deselectedMeshesNames.indexOf(name) > -1)
				{
					mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#3D4547");
					mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
				}
				else 
				{
					mesh.material.diffuseColor 	= newModelColor[newModelNames.indexOf(name)];
					mesh.material.albedoColor 	= newModelColor[newModelNames.indexOf(name)];
				}
				
				if (!flicker)
				{
					if ((errorList.indexOf(name) > -1) || (eStop))
					{
						mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#FF0000");
						mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FF0000");
					}
					else if (warningList.indexOf(name) > -1)
					{
						mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#FFA500");
						mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FFA500");
					}	
				}						
			}
		});	
		
		newPartNames.forEach(name =>
		{
			var mesh = scene.getMeshById(name);
		
			if (mesh)
			{
				if (selectedMeshesNames.indexOf(name) > -1)
				{
					mesh.material.diffuseColor 	= new BABYLON.Color3.Green();
					mesh.material.albedoColor 	= new BABYLON.Color3.Green();
				}
				else if (deselectedMeshesNames.indexOf(name) > -1)
				{
					mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#3D4547");
					mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
				}
				else 
				{
					mesh.material.diffuseColor 	= newPartColor[newPartNames.indexOf(name)];
					mesh.material.albedoColor 	= newPartColor[newPartNames.indexOf(name)];
				}
				
				if (!flicker)
				{
					if ((errorList.indexOf(name) > -1) || (eStop))
					{
						mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#FF0000");
						mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FF0000");
					}
					else if (warningList.indexOf(name) > -1)
					{
						mesh.material.diffuseColor 	= new BABYLON.Color3.FromHexString("#FFA500");
						mesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#FFA500");
					}	
				}						
			}
		});
			
		flicker = !flicker;	
	}
}

/*Extend the from the Rods forward*/
function ReefCutter_FrontBody_Pos_Rot()
{
	var DataKeys 								= Object.keys(plcData);
	
	var thrustBodyRotX 							= -99;
	var thrustBodyRotY 							= -99;
	
	var frontBodyPosX 							= -99;
	var frontBodyPosY 							= -99;
	var frontBodyPosZ 							= -99;
	var frontBodyRotX 							= -99;
	var frontBodyRotY 							= -99;
	var frontBodyRotZ 							= -99;
	
	var OldFrontBodyPosX 						= -99;
	var OldFrontBodyPosY 						= -99;
	var OldFrontBodyPosZ 						= -99;
	var OldFrontBodyRotX 						= -99;
	var OldFrontBodyRotY 						= -99;
	var OldFrontBodyRotZ 						= -99;
	
	var Process 								= false;
	
	if (replaying)
	{
		if (renderComplete)
		{
			thrustBodyRotX 								= RCReplayDataNow[105];
			thrustBodyRotY 								= RCReplayDataNow[106];
			
			frontBodyPosX 								= -1*RCReplayDataNow[101]/1000;
			frontBodyPosY 								= RCReplayDataNow[103]/1000;
			frontBodyPosZ 								= RCReplayDataNow[102]/1000;
			frontBodyRotX 								= thrustBodyRotX - RCReplayDataNow[107];
			frontBodyRotY 								= thrustBodyRotY - RCReplayDataNow[104];
			frontBodyRotZ 								= -1*RCReplayDataNow[108];
			
			Process 									= true;
		}
	}
	else
	{
		if ((typeof (plcData[DataKeys[DataKeys.indexOf("Thrust Body Roll")]]) !== 'undefined') && (renderComplete))
		{
			thrustBodyRotX 								= plcData[DataKeys[DataKeys.indexOf("Thrust Body Tilt")]].value;
			thrustBodyRotY 								= plcData[DataKeys[DataKeys.indexOf("Thrust Body Roll")]].value;
			
			frontBodyPosX 								= -1*plcData[DataKeys[DataKeys.indexOf("Cutting Head Body X")]].value/1000;
			frontBodyPosY 								= plcData[DataKeys[DataKeys.indexOf("Cutting Head Body Z")]].value/1000;
			frontBodyPosZ 								= plcData[DataKeys[DataKeys.indexOf("Cutting Head Body Y")]].value/1000;
			frontBodyRotX 								= thrustBodyRotX - plcData[DataKeys[DataKeys.indexOf("Cutting Head Tilt")]].value;
			frontBodyRotY 								= plcData[DataKeys[DataKeys.indexOf("Cutting Head Body A")]].value;
			frontBodyRotZ 								= thrustBodyRotY - plcData[DataKeys[DataKeys.indexOf("Cutting Head Roll")]].value;

			Process 									= true;
		}
	}
	
	if (Process === true)
	{
		var values 									= [frontBodyPosX,frontBodyPosY,frontBodyPosZ,frontBodyRotX,frontBodyRotY,frontBodyRotZ];
		
		for (let i = 0; i < values.length; i++) 
		{
			values[i] 									= parseInt(values[i]*1000)/1000;
		}
		
		var check 									= false;
		
		for (i = 0;i < values.length;i++)
		{
			if (Math.abs(oldValues[i] - values[i]) > 0.001)
			{
				check 										= true;
			}	
		}
		
		if (check === true)
		{
			var rodTL									= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 l rod");
			var rodTR									= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 r rod");
			var rodBL									= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 l rod");
			var rodBR									= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 r rod");
			
			var barTL									= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 l bar");
			var barTR									= scene.getMeshById("(ReefCutter) rbs-tc-160-ca-00 r bar");
			var barBL									= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 l bar");
			var barBR									= scene.getMeshById("(ReefCutter) rbs-tc-190-ca-00 r bar");

			var deltaPosX 								= oldValues[0] - values[0];
			var deltaPosY 								= oldValues[1] - values[1];
			var deltaPosZ 								= oldValues[2] - values[2];
			
			var deltaRotX 								= oldValues[3] - values[3];
			var deltaRotY 								= oldValues[5] - values[5];
			var deltaRotZ 								= oldValues[4] - values[4];
			
			var distance 								= Math.sqrt(values[0]**2 + values[1]**2 + values[2]**2);
			var oldDistance 							= Math.sqrt(oldValues[0]**2 + oldValues[1]**2 + oldValues[2]**2);
			var deltaPosDist 							= Math.abs(oldDistance - distance);
			var rodLength 								= 1.55+deltaPosDist;
			
			var frontMikkerPos							= document.getElementById("frontMikkerPos");
			var frontMikkerRot							= document.getElementById("frontMikkerRot");
			var frontViewPos 							= document.getElementById("frontViewPos");
			var frontViewRot 							= document.getElementById("frontViewRot");
			var frontMikkerLine							= document.getElementById("frontMikkerLine");
			var frontMikkerLineHor						= document.getElementById("frontMikkerLineHor");
			var frontMikkerLineVer						= document.getElementById("frontMikkerLineVer");
			
			var topMikkerPos 							= document.getElementById("topMikkerPos");
			var topMikkerRot 							= document.getElementById("topMikkerRot");
			var topViewPos 								= document.getElementById("topViewPos");
			var topViewRot 								= document.getElementById("topViewRot");
			var topMikkerLine 							= document.getElementById("topMikkerLine");
			var topMikkerLineHor 						= document.getElementById("topMikkerLineHor");
			var topMikkerLineVer 						= document.getElementById("topMikkerLineVer");
			
			var leftMikkerPos 							= document.getElementById("leftMikkerPos");
			var leftMikkerRot 							= document.getElementById("leftMikkerRot");
			var leftViewPos 							= document.getElementById("leftViewPos");
			var leftViewRot 							= document.getElementById("leftViewRot");
			var leftMikkerLine 							= document.getElementById("leftMikkerLine");
			var leftMikkerLineHor 						= document.getElementById("leftMikkerLineHor");
			var leftMikkerLineVer 						= document.getElementById("leftMikkerLineVer");
			
			var stateTopPos								= 0;
			var stateFrontPos 							= 0;
			var stateLeftPos 							= 0;
			var stateTopRot								= 0;
			var stateFrontRot 							= 0;
			var stateLeftRot 							= 0;
			
			var topPosX  								= document.getElementById('topPosX');
			var topPosZ  								= document.getElementById('topPosZ');
			var topRot  								= document.getElementById('topRot');
			
			var frontPosX  								= document.getElementById('frontPosX');
			var frontPosY  								= document.getElementById('frontPosY');
			var frontRot  								= document.getElementById('frontRot');
			
			var leftPosY  								= document.getElementById('leftPosY');
			var leftPosZ  								= document.getElementById('leftPosZ');
			var leftRot  								= document.getElementById('leftRot');
			
			topPosX.style.color  						= "#FFFFFF";
			topPosZ.style.color  						= "#FFFFFF";
			topRot.style.color  						= "#FFFFFF";
			
			frontPosX.style.color  						= "#FFFFFF";
			frontPosY.style.color  						= "#FFFFFF";
			frontRot.style.color  						= "#FFFFFF"; 
			
			leftPosY.style.color  						= "#FFFFFF";
			leftPosZ.style.color  						= "#FFFFFF";
			leftRot.style.color  						= "#FFFFFF";
			
			var xDiffRot 								= Math.atan(Math.abs(deltaPosZ)/rodLength);
			if (deltaPosZ < 0)
			{
				pivotCylTL.rotate(BABYLON.Axis.X, xDiffRot, BABYLON.Space.Local);
				pivotCylTR.rotate(BABYLON.Axis.X, xDiffRot, BABYLON.Space.Local);
				pivotCylBL.rotate(BABYLON.Axis.X, xDiffRot, BABYLON.Space.Local);
				pivotCylBR.rotate(BABYLON.Axis.X, xDiffRot, BABYLON.Space.Local);
						
				groupCylTL.position.y 						-= xDiffRot;
				groupCylTR.position.y 						-= xDiffRot;
				groupCylBL.position.y						-= xDiffRot;
				groupCylBR.position.y						-= xDiffRot;
							
				groupCylTL.position.z 						+= xDiffRot;
				groupCylTR.position.z 						+= xDiffRot;
				groupCylBL.position.z						+= xDiffRot;
				groupCylBR.position.z						+= xDiffRot;
			}
			else if (deltaPosZ > 0)
			{
				pivotCylTL.rotate(BABYLON.Axis.X, -xDiffRot, BABYLON.Space.Local);
				pivotCylTR.rotate(BABYLON.Axis.X, -xDiffRot, BABYLON.Space.Local);
				pivotCylBL.rotate(BABYLON.Axis.X, -xDiffRot, BABYLON.Space.Local);
				pivotCylBR.rotate(BABYLON.Axis.X, -xDiffRot, BABYLON.Space.Local);
						
				groupCylTL.position.y 						+= xDiffRot;
				groupCylTR.position.y 						+= xDiffRot;
				groupCylBL.position.y						+= xDiffRot;
				groupCylBR.position.y						+= xDiffRot;
							
				groupCylTL.position.z 						-= xDiffRot;
				groupCylTR.position.z 						-= xDiffRot;
				groupCylBL.position.z						-= xDiffRot;
				groupCylBR.position.z						-= xDiffRot;
			}
						
			var zDiffRot 								= Math.atan(Math.abs(deltaPosX)/rodLength);
			if (deltaPosX > 0)
			{
				pivotCylTL.rotate(BABYLON.Axis.Z, zDiffRot, BABYLON.Space.Local);
				pivotCylTR.rotate(BABYLON.Axis.Z, zDiffRot, BABYLON.Space.Local);
				pivotCylBL.rotate(BABYLON.Axis.Z, zDiffRot, BABYLON.Space.Local);
				pivotCylBR.rotate(BABYLON.Axis.Z, zDiffRot, BABYLON.Space.Local);
			}
			else if (deltaPosX < 0)
			{
				pivotCylTL.rotate(BABYLON.Axis.Z, -zDiffRot, BABYLON.Space.Local);
				pivotCylTR.rotate(BABYLON.Axis.Z, -zDiffRot, BABYLON.Space.Local);
				pivotCylBL.rotate(BABYLON.Axis.Z, -zDiffRot, BABYLON.Space.Local);
				pivotCylBR.rotate(BABYLON.Axis.Z, -zDiffRot, BABYLON.Space.Local);
			}
				
			groupCuttingHead.position.x 				= values[0];
			
			groupCylTL.position.x 						-= deltaPosX/2;
			groupCylTR.position.x 						-= deltaPosX/2;
			groupCylBL.position.x 						-= deltaPosX/2;
			groupCylBR.position.x 						-= deltaPosX/2;
			
			frontViewPos.style.left 					= "calc(0.2vw + "+		-values[0]+"vw)";
			frontMikkerLineVer.style.left				= "calc(-0.15vw + "+	-values[0]+"vw)";
			topViewPos.style.left 						= "calc(0.2vw + "+		-values[0]+"vw)";
			topMikkerLineVer.style.left					= "calc(-0.15vw + "+	-values[0]+"vw)";
			
			if (Math.abs(values[0]) >= 0.1) 
			{
				stateFrontPos								= 3;
				stateTopPos									= 3;
				
				frontPosX.style.color						= "#FF0000";
				topPosX.style.color							= "#FF0000";
			}
			else 
			{
				if (Math.abs(values[0]) >= 0.05)
				{
					stateFrontPos								= 2;
					stateTopPos									= 2;
				
					frontPosX.style.color						= "#FFA500";
					topPosX.style.color							= "#FFA500";
				}
				else if (Math.abs(values[0]) >= 0.001)
				{
					stateFrontPos								= 1;
					stateTopPos									= 1;
				}
			}	
			
			groupCuttingHead.position.y 				= values[1];
			
			groupCylTL.position.y						-= deltaPosZ/2;
			groupCylTR.position.y 						-= deltaPosZ/2;
			groupCylBL.position.y 						-= deltaPosZ/2;
			groupCylBR.position.y 						-= deltaPosZ/2;
			
			topViewPos.style.top 						= "calc(0.2vw + "+		-values[1]+"vw)";
			topMikkerLineHor.style.top					= "calc(-0.1vw + "+		-values[1]+"vw)";
			leftViewPos.style.top 						= "calc(0.2vw + "+		-values[1]+"vw)";
			leftMikkerLineHor.style.top 				= "calc(-0.1vw + "+		-values[1]+"vw)";	

			if ((Math.abs(values[1]) >= 0.75) || (values[1] < 0))
			{
				if (stateTopPos < 3)
				{
					stateTopPos									= 3;
					topPosZ.style.color  						= "#FF0000";
				}
				
				stateLeftPos								= 3;
				leftPosZ.style.color  						= "#FF0000";
			}
			else 
			{
				if (Math.abs(values[1]) >= 0.6)
				{
					if (stateTopPos < 2)
					{
						stateTopPos									= 2;
						topPosZ.style.color  						= "#FFA500";
					}
					
					stateLeftPos								= 2;
					leftPosZ.style.color  						= "#FFA500";
				}
				else if (Math.abs(values[1]) >= 0.001)
				{
					if (stateTopPos < 1)
					{
						stateTopPos									= 1;
					}
					
					stateLeftPos								= 1;
				}
			}
			
			groupCuttingHead.position.z 				= values[2];
			rodTL.position.y 							-= deltaPosY;
			rodTR.position.y 							-= deltaPosY;
			rodBL.position.y							-= deltaPosY;
			rodBR.position.y							-= deltaPosY;
			
			var xDiffPos 								= 0.1375*Math.tan(BABYLON.Tools.ToRadians(deltaRotX));
			rodTL.position.y 							+= xDiffPos;
			rodTR.position.y							+= xDiffPos;
			rodBL.position.y							-= xDiffPos;
			rodBR.position.y							-= xDiffPos;
		
			var zDiffPos 								= 1.4175*Math.tan(BABYLON.Tools.ToRadians(deltaRotZ));
			rodTL.position.y							-= zDiffPos;
			rodTR.position.y							+= zDiffPos;
			rodBL.position.y 							-= zDiffPos;
			rodBR.position.y							+= zDiffPos;
							
			frontViewPos.style.top 						= "calc(0.2vw + "+		-values[2]+"vw)";
			frontMikkerLineHor.style.top				= "calc(-0.1vw + "+		-values[2]+"vw)";
			leftViewPos.style.left 						= "calc(0.2vw + "+		values[2]+"vw)";
			leftMikkerLineVer.style.left				= "calc(-0.15vw + "+	values[2]+"vw)";
				
			if (Math.abs(values[2]) >= 0.1)
			{
				if (stateFrontPos < 3)
				{
					stateFrontPos								= 3;
					frontPosY.style.color  						= "#FF0000";
				}
				
				if (stateLeftPos < 3)
				{
					stateLeftPos								= 3;
					leftPosY.style.color  						= "#FF0000";
				}
			}
			else
			{
				if (Math.abs(values[2]) >= 0.05)
				{
					if (stateFrontPos < 2)
					{
						stateFrontPos								= 2;
						frontPosY.style.color  						= "#FFA500";
					}
					
					if (stateLeftPos < 2)
					{
						stateLeftPos								= 2;
						leftPosY.style.color  						= "#FFA500";
					}
				}
				else if (Math.abs(values[2]) >= 0.001)
				{
					if (stateFrontPos < 1)
					{
						stateFrontPos								= 1;
					}
					
					if (stateLeftPos < 1)
					{
						stateLeftPos								= 1;
					}
				}	
			}
				
			groupCuttingHead.rotation.x 				= BABYLON.Tools.ToRadians(values[3]);
			leftViewRot.style.transform 				= "rotate("+values[3]+"deg)";
			leftMikkerLine.style.transform 				= "rotate("+values[3]+"deg)";
			
			if (Math.abs(values[3]) >= 3)
			{
				stateLeftRot								= 3;
				leftRot.style.color  						= "#FF0000";
			}
			else 
			{
				if (Math.abs(values[3]) >= 2.5)
				{
					stateLeftRot								= 2;
					leftRot.style.color  						= "#FFA500";
				}
				else if (Math.abs(values[3]) >= 0.0001)
				{
					stateLeftRot								= 1;
				}
			}
			
			groupCuttingHead.rotation.z 				= BABYLON.Tools.ToRadians(values[4]);	
			topViewRot.style.transform 					= "rotate("+values[4]+"deg)";
			topMikkerLine.style.transform 				= "rotate("+values[4]+"deg)";
			
			if (Math.abs(values[4]) >= 3)
			{
				stateTopRot									= 3;
				topRot.style.color  						= "#FFFF00";
			}
			else 
			{
				if (Math.abs(values[4]) >= 2.5)
				{
					stateTopRot									= 2;
					topRot.style.color  						= "#FFA500";
				}
				else if (Math.abs(values[4]) >= 0.0001)
				{
					stateTopRot									= 1;
				}
			}	
			
			groupCuttingHead.rotation.y 				= BABYLON.Tools.ToRadians(values[5]);
			frontViewRot.style.transform 				= "rotate("+values[5]+"deg)";
			frontMikkerLine.style.transform 			= "rotate("+values[5]+"deg)";
				
			if (Math.abs(values[5]) >= 3)
			{
				stateFrontRot								= 3;
				frontRot.style.color  						= "#FF0000";
			}
			else 
			{
				if (Math.abs(values[5]) >= 2.5)
				{
					stateFrontRot								= 2;
					frontRot.style.color  						= "#FFA500";
				}
				else if (Math.abs(values[5]) >= 0.0001)
				{
					stateFrontRot								= 1;
				}
			}		
			
			switch (stateFrontPos)
			{
				case 3:
					frontMikkerPos.src 							= "./css/mikkerPosRed.png";
					frontMikkerLineHor.src 						= "./css/mikkerLineRed.png";
					frontMikkerLineVer.src 						= "./css/mikkerLineRed.png";
					break;
				case 2:
					frontMikkerPos.src 							= "./css/mikkerPosOrange.png";
					frontMikkerLineHor.src 						= "./css/mikkerLineOrange.png";
					frontMikkerLineVer.src 						= "./css/mikkerLineOrange.png";
					break;
				case 1:
					frontMikkerPos.src 							= "./css/mikkerPosGreen.png";
					frontMikkerLineHor.src 						= "./css/mikkerLineGreen.png";
					frontMikkerLineVer.src 						= "./css/mikkerLineGreen.png";
					break;
				case 0:
					frontMikkerPos.src 							= "./css/mikkerPosWhite.png";
					frontMikkerLineHor.src 						= "./css/mikkerLineWhite.png";
					frontMikkerLineVer.src 						= "./css/mikkerLineWhite.png";
					break;
			}
			
			switch (stateTopPos)
			{
				case 3:
					topMikkerPos.src 							= "./css/mikkerPosRed.png";
					topMikkerLineHor.src 						= "./css/mikkerLineRed.png";
					topMikkerLineVer.src 						= "./css/mikkerLineRed.png";
					break;
				case 2:	
					topMikkerPos.src 							= "./css/mikkerPosOrange.png";
					topMikkerLineHor.src 						= "./css/mikkerLineOrange.png";
					topMikkerLineVer.src 						= "./css/mikkerLineOrange.png";
					break;
				case 1:
					topMikkerPos.src 							= "./css/mikkerPosGreen.png";
					topMikkerLineHor.src 						= "./css/mikkerLineGreen.png";
					topMikkerLineVer.src 						= "./css/mikkerLineGreen.png";
					break;
				case 0:
					topMikkerPos.src 							= "./css/mikkerPosWhite.png";
					topMikkerLineHor.src 						= "./css/mikkerLineWhite.png";
					topMikkerLineVer.src 						= "./css/mikkerLineWhite.png";
					break;
			}
			
			switch (stateLeftPos)
			{
				case 3:
					leftMikkerPos.src 							= "./css/mikkerPosRed.png";
					leftMikkerLineHor.src 						= "./css/mikkerLineRed.png";
					leftMikkerLineVer.src 						= "./css/mikkerLineRed.png";
					break;
				case 2:	
					leftMikkerPos.src 							= "./css/mikkerPosOrange.png";
					leftMikkerLineHor.src 						= "./css/mikkerLineOrange.png";
					leftMikkerLineVer.src 						= "./css/mikkerLineOrange.png";
					break;
				case 1:
					leftMikkerPos.src 							= "./css/mikkerPosGreen.png";
					leftMikkerLineHor.src 						= "./css/mikkerLineGreen.png";
					leftMikkerLineVer.src 						= "./css/mikkerLineGreen.png";
					break;
				case 0:
					leftMikkerPos.src 							= "./css/mikkerPosWhite.png";
					leftMikkerLineHor.src 						= "./css/mikkerLineWhite.png";
					leftMikkerLineVer.src 						= "./css/mikkerLineWhite.png";
					break;
			}
			
			switch (stateFrontRot)
			{
				case 3:
					frontMikkerRot.src 							= "./css/mikkerRotRed.png";
					frontMikkerLine.src 						= "./css/mikkerLineRed.png";
					break;
				case 2:
					frontMikkerRot.src 							= "./css/mikkerRotOrange.png";
					frontMikkerLine.src 						= "./css/mikkerLineOrange.png";
					break;
				case 1:
					frontMikkerRot.src 							= "./css/mikkerRotGreen.png";
					frontMikkerLine.src 						= "./css/mikkerLineGreen.png";
					break;
				case 0:
					frontMikkerRot.src 							= "./css/mikkerRotWhite.png";
					frontMikkerLine.src 						= "./css/mikkerLineWhite.png";
					break;
			}
			
			switch (stateTopRot)
			{
				case 3:
					topMikkerRot.src 							= "./css/mikkerRotRed.png";
					topMikkerLine.src 							= "./css/mikkerLineRed.png";
					break;
				case 2:	
					topMikkerRot.src 							= "./css/mikkerRotOrange.png";
					topMikkerLine.src 							= "./css/mikkerLineOrange.png";
					break;
				case 1:
					topMikkerRot.src 							= "./css/mikkerRotGreen.png";
					topMikkerLine.src 							= "./css/mikkerLineGreen.png";
					break;
				case 0:
					topMikkerRot.src 							= "./css/mikkerRotWhite.png";
					topMikkerLine.src 							= "./css/mikkerLineWhite.png";
					break;
			}
			
			switch (stateLeftRot)
			{
				case 3:
					leftMikkerRot.src 							= "./css/mikkerRotRed.png";
					leftMikkerLine.src 							= "./css/mikkerLineRed.png";
					break;
				case 2:	
					leftMikkerRot.src 							= "./css/mikkerRotOrange.png";
					leftMikkerLine.src 							= "./css/mikkerLineOrange.png";
					break;
				case 1:
					leftMikkerRot.src 							= "./css/mikkerRotGreen.png";
					leftMikkerLine.src 							= "./css/mikkerLineGreen.png";
					break;
				case 0:
					leftMikkerRot.src 							= "./css/mikkerRotWhite.png";
					leftMikkerLine.src 							= "./css/mikkerLineWhite.png";
					break;
			}
			
			topPosX.innerHTML 							= "X Pos: "+-values[0]*1000+"mm";
			frontPosX.innerHTML 						= "X Pos: "+-values[0]*1000+"mm";
			
			frontPosY.innerHTML 						= "Y Pos: "+values[2]*1000+"mm";
			leftPosY.innerHTML 							= "Y Pos: "+values[2]*1000+"mm";
			
			topPosZ.innerHTML 							= "Z Pos: "+values[1]*1000+"mm";
			leftPosZ.innerHTML 							= "Z Pos: "+values[1]*1000+"mm";
			
			leftRot.innerHTML 							= "X Rot: "+values[3]+"°";
			topRot.innerHTML 							= "Y Rot: "+values[4]+"°";
			frontRot.innerHTML 							= "Z Rot: "+values[5]+"°";
			
			var warningError 							= 0;
			
			Object.keys(plcErrors).forEach(key =>
			{
				if (plcErrors[key].value === 1)
				{
					warningError 								= 1;
				}
			});
			
			if (warningError === 1)
			{	
				ReefCutter_Errors(plcErrors);
				LoadModelInfoRequest();
			}
			
			oldValues 									= values;
		}
	}
}

/*Extend or retract the rod*/
function ReefCutter_SG_Extension()
{
	var Stabs 			= [0,0,0,0];
	
	Object.keys(plcData).forEach(key =>
	{
		if ((plcData[key].name === "Manual Up") && (plcData[key].value === 1))
		{
			Stabs[0]			= 1;
			Stabs[1]			= 1;
		}
		else if ((plcData[key].name === "Manual Right") && (plcData[key].value === 1))
		{
			Stabs[2]			= 1;
		}
		else if ((plcData[key].name === "Manual Left") && (plcData[key].value === 1))
		{
			Stabs[3]			= 1;
		}
		else if ((plcData[key].name === "Manual Rotate Left") && (plcData[key].value === 1))
		{
			Stabs[0]			= 1;
		}
		else if ((plcData[key].name === "Manual Rotate Right") && (plcData[key].value === 1))
		{
			Stabs[1]			= 1;
		}
	});
	
	var name 			= "(ReefCutter) rbs-fb-253 l";
	var mesh 			= scene.getMeshById(name);
		
	if (Stabs[0] === 1)
	{
		mesh.position.z 	= -0.08;
	}
	else if (Stabs[0] === 0) 
	{
		mesh.position.z 	= -0.17;
	}
	
	name 				= "(ReefCutter) rbs-fb-253 r";
	mesh 				= scene.getMeshById(name);
		
	if (Stabs[1] === 1)
	{
		mesh.position.z 	= -0.08;
	}
	else if (Stabs[1] === 0)
	{
		mesh.position.z 	= -0.17;
	}
	
	name 				= "(ReefCutter) rbs-fb-248 l";
	mesh 				= scene.getMeshById(name);
		
	if (Stabs[2] === 1)
	{
		mesh.position.x 	= 1.16;
	}
	else if (Stabs[2] === 0)
	{
		mesh.position.x 	= 1.06;
	}
	
	name 				= "(ReefCutter) rbs-fb-248 r";
	mesh 				= scene.getMeshById(name);
		
	if (Stabs[3] === 1)
	{
		mesh.position.x 	= -1.16;
	}
	else if (Stabs[3] === 0)
	{
		mesh.position.x 	= -1.06;
	}
	
	/*for (i = 1; i < 8; i++)
	{
		switch (i)
		{
			case 1:
				var name 	= "(ReefCutter) rbs-fb-248 l";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "x";
				var sign 	= "+";
				var start 	= 1.06;
				var white 	= 1.11;
				var orange 	= 1.125;
				var red 	= 1.135;
				var Check  	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Stabilizers SL Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;	
			case 2:
				var name 	= "(ReefCutter) rbs-fb-248 r";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "x";
				var sign 	= "-";
				var start 	= -1.06;
				var white 	= -1.11;
				var orange 	= -1.125;
				var red 	= -1.135;
				var Check 	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Stabilizers SR Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
			case 3:
				var name 	= "(ReefCutter) rbs-fb-253 l";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "z";
				var sign 	= "+";
				var start 	= -0.17;
				var white 	= -0.12;
				var orange 	= -0.105;
				var red 	= -0.095;
				var Check  	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Stabilizers TL Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
			case 4:
				var name 	= "(ReefCutter) rbs-fb-253 r";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "z";
				var sign 	= "+";
				var start 	= -0.17;
				var white 	= -0.12;
				var orange 	= -0.105;
				var red 	= -0.095;
				var Check  	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Stabilizers TR Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
			case 5:
				var name 	= "(ReefCutter) rbs-tb-gf-gf-1-fm l";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "z";
				var sign 	= "+";
				var start 	= 0;
				var white 	= 0.05;
				var orange 	= 0.065;
				var red 	= 0.075;
				var Check 	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Gripper L Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
			case 6:
				var name 	= "(ReefCutter) rbs-tb-gf-gf-1-fm r";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "z";
				var sign 	= "+";
				var start 	= 0;
				var white 	= 0.05;
				var orange 	= 0.065;
				var red 	= 0.075;
				var Check  	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Gripper R Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
			case 7:
				var name 	= "(ReefCutter) rbs-pc-091";
				var mesh 	= scene.getMeshById(name);
				var dir 	= "z";
				var sign 	= "-";
				var start 	= -0.14;
				var white 	= -0.22;
				var orange 	= -0.244;
				var red 	= -0.260;
				var Check  	= -1;
				
				Object.keys(plcData).forEach(key =>
				{
					if (plcData[key].name === "Plundger Valve Open")
					{
						Check = plcData[key].value;
					}
				});
				
				break;
		}
		
		if (mesh)
		{
			if (Check === 1)
			{
				if (dir === "z")
				{
					if (sign === "+")
					{
						if (mesh.position.z < orange)
						{
							mesh.position.z += 0.0001;
						}
					}
					else
					{
						if (mesh.position.z > orange)
						{
							mesh.position.z -= 0.0001;
						}
					}	
				}
				else
				{
					if (sign === "+")
					{
						if (mesh.position.x < orange)
						{
							mesh.position.x += 0.0001;
						}
					}
					else
					{
						if (mesh.position.x > orange)
						{
							mesh.position.x -= 0.0001;
						}
					}	
				}
			}
			else if (Check === 0)
			{
				if (dir === "z")
				{
					if (sign === "+")
					{
						if (mesh.position.z > start)
						{
							mesh.position.z -= 0.0001;
						}
					}
					else
					{
						if (mesh.position.z < start)
						{
							mesh.position.z += 0.0001;
						}
					}
				}
				else
				{
					if (sign === "+")
					{
						if (mesh.position.x > start)
						{
							mesh.position.x -= 0.0001;
						}				
					}
					else
					{
						if (mesh.position.x < start)
						{
							mesh.position.x += 0.0001;
						}
					}
				}
			}	
		}
	}*/
}

/*Show or Hide the information*/
function ReefCutter_Information_ShowHide(val)
{
	var btnGeneral				= document.getElementById('btnGeneral');
	var btnThrust				= document.getElementById('btnThrust');
	var btnStabil				= document.getElementById('btnStabil');
	var btnGripper				= document.getElementById('btnGripper');
	var btnCutter				= document.getElementById('btnCutter');
	
	var sheetGeneral			= document.getElementById('sheetGeneral');
	var sheetThrust				= document.getElementById('sheetThrust');
	var sheetStabil				= document.getElementById('sheetStabil');
	var sheetGripper			= document.getElementById('sheetGripper');
	var sheetCutter				= document.getElementById('sheetCutter');
	
	btnGeneral.style.background = "grey";
	btnThrust.style.background 	= "grey";
	btnStabil.style.background 	= "grey";
	btnGripper.style.background = "grey";
	btnCutter.style.background 	= "grey";
	
	sheetGeneral.style.display 	= "none";
	sheetThrust.style.display 	= "none";
	sheetStabil.style.display 	= "none";
	sheetGripper.style.display 	= "none";
	sheetCutter.style.display 	= "none";
	
	switch(val)
	{
		case 0:
			btnGeneral.style.background = "#bada55";
			sheetGeneral.style.display 	= "block";
			ReefCutter_Group_Select(document.getElementById('rf-all-button'));
			break;
		case 1:
			btnThrust.style.background 	= "#bada55";
			sheetThrust.style.display 	= "block";
			ReefCutter_Group_Select(document.getElementById('thrustcylinders-button'));
			break;
		case 2:
			btnStabil.style.background 	= "#bada55";
			sheetStabil.style.display 	= "block";
			ReefCutter_Group_Select(document.getElementById('stabilizers-button'));
			break;	
		case 3:
			btnGripper.style.background = "#bada55";
			sheetGripper.style.display 	= "block";
			ReefCutter_Group_Select(document.getElementById('grippers-button'));
			break;		
		case 4:
			btnCutter.style.background 	= "#bada55";
			sheetCutter.style.display 	= "block";
			ReefCutter_Group_Select(document.getElementById('cutters-button'));
			break;		
	}
}

/*Calculate ton values for thrust cylinders,stabilizer and grippers*/
function ReefCutter_Tonner()
{
	if (errorsLoaded);
	{
		var thurstTLpress 	= -1;
		var thurstTRpress 	= -1;
		var thurstBLpress 	= -1;
		var thurstBRpress 	= -1;

		var stabilSLpress 	= -1;
		var stabilSRpress 	= -1;
		var stabilTLpress 	= -1;
		var stabilTRpress 	= -1;

		var gripperALpress 	= -1;
		var gripperARpress 	= -1;
		var gripperBLpress 	= -1;
		var gripperBRpress 	= -1;
		
		var names			= [	'Gripper Cylinder PressureA Left','Gripper Cylinder PressureA Right','Gripper Cylinder PressureB Left','Gripper Cylinder PressureB Right',
								'Thrust Position Top Left','Thrust Position Top Right','Thrust Position Bottom Left','Thrust Position Bottom Right',
								'Cutter RPM Top Left','Cutter RPM Top Right','Cutter RPM Bottom Left','Cutter RPM Bottom Right',
								'Stabilizers Pressure Side Left','Stabilizers Pressure Side Right','Stabilizers Pressure Top Left','Stabilizers Pressure Top Right',
								'Feed-Rate','Avg Thrust Cylinder Tons','Supply Line Flow Pressure PT5','Vacuum Pressure After Filters','Display Pump Tank Temperature TT1','Display Pump Tank Level LT1',
								'Thrust Pressure Top Left','Thrust Pressure Top Right','Thrust Pressure Bottom Left','Thrust Pressure Bottom Right'];
		
		var tons 			= new Array(26).fill(-1);
		var thrustWETons 	= new Array(4).fill(0);
		var thrustWEPos 	= new Array(4).fill(0);
		var thrustValPos 	= 0;
		var cutterWE		= 0;
		var cutterVal		= 0;
		
		Object.keys(plcData).forEach(data =>
		{
			for (i = 0; i < 26; i++)
			{
				if (data === names[i])
				{
					tons[i] 												= plcData[data].value;
					document.getElementById(names[i]+" Value").innerHTML 	= tons[i].toFixed(3);
					
					/*Sum the values for the AVG*/
					if ((names[i].includes('Thrust')) && (names[i].includes('Pos')))
					{
						thrustValPos 	+= tons[i];
					}
					else if ((names[i].includes('Motor')) && (names[i].includes('RPM')))
					{
						cutterVal 		+= tons[i];
					}
					
					/*Some tags start with r, those from pos 14 do not*/
					if (i < 14)
					{
						/*If both the error and the warning exists for the data tag*/
						if ((plcErrors["Error"+names[i].substring(1)]) && (plcErrors["Warning"+names[i].substring(1)]))
						{
							if (plcErrors["Error"+names[i].substring(1)].value === 1)
							{
								if (names[i].includes('Thrust'))
								{
									if (names[i].includes('_TL'))
									{
										thrustWETons[0]	= 2;
									}
									else if (names[i].includes('_TR'))
									{
										thrustWETons[1]	= 2;
									}
									else if (names[i].includes('_BL'))
									{
										thrustWETons[2]	= 2;
									}
									else if (names[i].includes('_BR'))
									{
										thrustWETons[3]	= 2;
									}
								}
								else if (names[i].includes('Cutter'))
								{
									cutterWE	= 2;
								}
								else
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FF0000";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FF0000";
							}
							else if (plcErrors["Warning"+names[i].substring(1)].value === 1)
							{
								if (names[i].includes('Thrust'))
								{
									if (names[i].includes('_TL'))
									{
										if (thrustWETons[0] != 2)
										{
											thrustWETons[0]	= 1;
										}
									}
									else if (names[i].includes('_TR'))
									{
										if (thrustWETons[1] != 2)
										{
											thrustWETons[1]	= 1;
										}
									}
									else if (names[i].includes('_BL'))
									{
										if (thrustWETons[2] != 2)
										{
											thrustWETons[2]	= 1;
										}
									}
									else if (names[i].includes('_BR'))
									{
										if (thrustWETons[3] != 2)
										{
											thrustWETons[3]	= 1;
										}
									}
								}
								else if (names[i].includes('Cutter'))
								{
									if (cutterWE[0] != 2)
									{
										cutterWE	= 1;
									}
								}
								else
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FFA500";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FFA500";
							}	
							else
							{
								if (!names[i].includes('Thrust'))
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FFFFFF";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FFFFFF";
							}
						}	
					}
					else
					{
						/*If both the error and the warning exists for the data tag*/
						if ((plcErrors["Error"+names[i].substring(1)]) && (plcErrors["Warning"+names[i].substring(1)]))
						{
							if (plcErrors["Error"+names[i]].value === 1)
							{
								if (names[i].includes('Thrust'))
								{
									if (names[i].includes('_TL'))
									{
										thrustWEPos[0] 	= 2;
									}
									else if (names[i].includes('_TR'))
									{
										thrustWEPos[1] 	= 2;
									}
									else if (names[i].includes('_BL'))
									{
										thrustWEPos[2] 	= 2;
									}
									else if (names[i].includes('_BR'))
									{
										thrustWEPos[3] 	= 2;
									}
								}
								else
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FF0000";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FF0000";
							}
							else if (plcErrors["Warning"+names[i]].value === 1)
							{
								if (names[i].includes('Thrust'))
								{
									if (names[i].includes('_TL'))
									{
										if (thrustWEPos[0] != 2)
										{
											thrustWEPos[0] 	= 1;
										}
									}
									else if (names[i].includes('_TR'))
									{
										if (thrustWEPos[1] != 2)
										{
											thrustWEPos[1] 	= 1;
										}
									}
									else if (names[i].includes('_BL'))
									{
										if (thrustWEPos[2] != 2)
										{
											thrustWEPos[2] 	= 1;
										}
									}
									else if (names[i].includes('_BR'))
									{
										if (thrustWEPos[3] != 2)
										{
											thrustWEPos[3] 	= 1;
										}
									}
								}
								else
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FFA500";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FFA500";
							}	
							else
							{
								if (!names[i].includes('Thurst'))
								{
									document.getElementById(names[i]+" Title").style.color 	= "#FFFFFF";
								}
								
								document.getElementById(names[i]+" Value").style.color 	= "#FFFFFF";
							}
						}	
					}
				}
			}
		});	
		
		/*Color change for general tab*/
		if (Math.max(...thrustWETons) === 2)
		{
			document.getElementById("Avg Thrust Cylinder Tons Title").style.color 	= "#FFA500";
			document.getElementById("Avg Thrust Cylinder Tons Title").style.color 	= "#FFA500";
		}
		else if (Math.max(...thrustWETons) === 1)
		{
			document.getElementById("Avg Thrust Cylinder Tons Title").style.color 	= "#FFA500";
			document.getElementById("Avg Thrust Cylinder Tons Title").style.color 	= "#FFA500";
		}
		else
		{
			document.getElementById("Avg Thrust Cylinder Tons Title").style.color 	= "#FFFFFF";
			document.getElementById("Avg Thrust Cylinder Tons Value").style.color 	= "#FFFFFF";
		}
		
		document.getElementById("AvgThrustCylPos Value").style.color 	= "#FF0000";
		if (Math.max(...thrustWEPos) === 2)
		{
			document.getElementById("AvgThrustCylPos Title").style.color 	= "#FF0000";
			document.getElementById("AvgThrustCylPos Value").style.color 	= "#FF0000";
		}
		else if (Math.max(...thrustWEPos) === 1)
		{
			document.getElementById("AvgThrustCylPos Title").style.color 	= "#FFA500";
			document.getElementById("AvgThrustCylPos Value").style.color 	= "#FFA500";
		}
		else
		{
			document.getElementById("AvgThrustCylPos Title").style.color 	= "#FFFFFF";
			document.getElementById("AvgThrustCylPos Value").style.color 	= "#FFFFFF";
		}
		
		document.getElementById("AvgCutterRPM Value").style.color 	= "#FF0000";
		if (cutterWE === 2)
		{
			document.getElementById("AvgCutterRPM Title").style.color 	= "#FF0000";
			document.getElementById("AvgCutterRPM Value").style.color 	= "#FF0000";
		}
		else if (cutterWE === 1)
		{
			document.getElementById("AvgCutterRPM Title").style.color 	= "#FFA500";
			document.getElementById("AvgCutterRPM Value").style.color 	= "#FFA500";
		}
		else
		{
			document.getElementById("AvgCutterRPM Title").style.color 	= "#FFFFFF";
			document.getElementById("AvgCutterRPM Value").style.color 	= "#FFFFFF";
		}
		
		/*Color change for thrust title tab*/
		for (i = 0; i < 4; i++)
		{
			var name 	= "rThrustPress_";
			
			if (i === 0)
			{
				name 	= name + "TL Title"; 
			}
			else if (i === 1)
			{
				name 	= name + "TR Title"; 
			}
			else if (i === 2)
			{
				name 	= name + "BL Title"; 
			}
			else if (i === 3)
			{
				name 	= name + "BR Title"; 
			}
			
			if (Math.max(...[thrustWEPos[i],thrustWETons[i]]) === 2)
			{
				document.getElementById(name).style.color 	= "#FF0000";
			}
			else if (Math.max(...[thrustWEPos[i],thrustWETons[i]]) === 1)
			{
				document.getElementById(name).style.color 	= "#FFA500";
			}
			else
			{
				document.getElementById(name).style.color 	= "#FFFFFF";	
			}
		}
		
		/*Calculate the averages*/
		thrustValPos	/= 4;
		cutterVal		/= 4;
		
		document.getElementById("AvgThrustCylPos Value").innerHTML 	= thrustValPos.toFixed(3);
		document.getElementById("AvgCutterRPM Value").innerHTML 	= cutterVal.toFixed(3);
	}
}

/*Toggle View button*/
function ReefCutter_ToggleView()
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

/*Replay data*/
function ReefCutter_Replay()
{
	/*var btn 				= document.getElementById('extra2-button');
	var block 				= document.getElementById('block_br2');
	
	if ((btn.style.background === "grey") || (btn.style.background === ""))
	{
		btn.style.background	= "#bada55";
		block.style.display 	= "block";
		ReplayListRequest();
	}
	else
	{
		btn.style.background 	= "grey";
		block.style.display 	= "none";
	}*/

	Swal.fire('TBD');
}

/*Group ReefCutter*/
function ReefCutter_Groups()
{
	if (newModel.length === 21)
	{
		newModel.forEach(Model =>
		{
			var snippet 			= Model.idname.substring(20,35);
			
			if ((snippet === "160-ca-00 r bar") || (snippet === "160-ca-00 r rod"))
			{
				scene.getMeshById(Model.idname).parent	= groupCylTR;
			}
			else if ((snippet === "160-ca-00 l bar") || (snippet === "160-ca-00 l rod"))
			{
				scene.getMeshById(Model.idname).parent 	= groupCylTL;
			}
			else if ((snippet === "190-ca-00 r bar") || (snippet === "190-ca-00 r rod"))
			{
				scene.getMeshById(Model.idname).parent 	= groupCylBR;
			}
			else if ((snippet === "190-ca-00 l bar") || (snippet === "190-ca-00 l rod"))
			{
				scene.getMeshById(Model.idname).parent 	= groupCylBL;
			}
			
			groupCylTL.parent						= pivotCylTL;
			groupCylTR.parent						= pivotCylTR;
			groupCylBL.parent						= pivotCylBL;
			groupCylBR.parent						= pivotCylBR;
							
			pivotCylTL.parent 						= groupThrustCyls;
			pivotCylTR.parent 						= groupThrustCyls;
			pivotCylBL.parent 						= groupThrustCyls;
			pivotCylBR.parent 						= groupThrustCyls;
			
			var snippet 							= Model.idname.substring(13,23);
			
			if ((snippet === "rbs-fb-248") || (snippet === "rbs-fb-253"))
			{
				scene.getMeshById(Model.idname).parent 	= groupStabs;
			}
			else if ((snippet === "rbs-fb-298") || (snippet === "rbs-fb-299") || (snippet === "rbs-fb-300") || (snippet === "rbs-fb-301"))
			{
				scene.getMeshById(Model.idname).parent 	= groupCutters;
			}
			else if ((snippet === "rbs-fb-090") || (snippet === "rbs-pc-091"))
			{
				scene.getMeshById(Model.idname).parent 	= groupCuttingHead;
			}
			else if (snippet === "rbs-tb-ga-")
			{
				scene.getMeshById(Model.idname).parent 	= groupThrustBody;
			}
			
		});
			
		newModel.forEach(Model =>
		{	
			if (Model.parent === null)
			{
				Model.parent 							= groupGrippers;
			}
		});
		
		groupGrippers.parent					= groupThrustBody;
					
		groupStabs.parent						= groupCuttingHead;
		groupCutters.parent						= groupCuttingHead;
					
		groupCuttingHead.parent					= groupAll;
		groupThrustBody.parent					= groupAll;
		groupThrustCyls	.parent					= groupAll;
		
		ReefCutter_AlignGroup();
	}
}
	
/*Decide which group to show*/
function ReefCutter_Group_Select(Element)
{
	var btnAll 						= document.getElementById('rf-all-button'); 
	var btnThrustBody 				= document.getElementById('thrustbody-button'); 
	var btnCuttingHead 				= document.getElementById('cuttinghead-button'); 
	var btnCutters 					= document.getElementById('cutters-button'); 
	var btnCylinders 				= document.getElementById('thrustcylinders-button');  
	var btnStabilizers				= document.getElementById('stabilizers-button'); 
	var btnGrippers					= document.getElementById('grippers-button');  
	
	btnAll.style.background			= "grey";
	btnThrustBody.style.background	= "grey";
	btnCuttingHead.style.background	= "grey";
	btnCutters.style.background		= "grey";
	btnCylinders.style.background	= "grey";
	btnStabilizers.style.background	= "grey";
	btnGrippers.style.background	= "grey";
	
	ReefCutter_HideGroup(groupAll);
		
	console.log("Thrust Body:	",groupThrustBody.getChildMeshes());
	console.log("Cutting Head:	",groupCuttingHead.getChildMeshes());
	console.log("Cutters:		",groupCutters.getChildMeshes());
	console.log("Cylinders:		",groupThrustCyls.getChildMeshes());
	console.log("Stabilizers:	",groupStabs.getChildMeshes());
	console.log("Grippers:		",groupGrippers.getChildMeshes());
	
	switch (Element.id)
	{
		case "rf-all-button":			btnAll.style.background			= "#bada55";
										ReefCutter_ShowGroup(groupAll);
										showGroup 						= 1;
										break;
		case "thrustbody-button":		btnThrustBody.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupThrustBody);
										showGroup 						= 2;
										break;
		case "cuttinghead-button":		btnCuttingHead.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupCuttingHead);
										showGroup 						= 3;
										break;	
		case "cutters-button":			btnCutters.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupCutters);
										showGroup 						= 4;
										break;
		case "thrustcylinders-button":	btnCylinders.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupThrustCyls);
										showGroup 						= 5;
										break;	
		case "stabilizers-button":		btnStabilizers.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupStabs);
										showGroup 						= 6;
										break;
		case "grippers-button":			btnGrippers.style.background	= "#bada55";
										ReefCutter_ShowGroup(groupGrippers);
										showGroup 						= 7;
										break;				
	}
}

/*Path button*/
function ReefCutter_Path_Button()
{
	/*var btn 				= document.getElementById('path-button');
	var block 				= document.getElementById('block_tr2');
	
	ReefCutter_HolePath();
	
	if ((btn.style.background === "grey") || (btn.style.background === ""))
	{
		btn.style.background	= "#bada55";
		ReefCutter_Path(1);
	}
	else
	{
		btn.style.background 	= "grey";
		ReefCutter_Path(0);
	}*/
	
	Swal.fire('TBD');	
}

/*Show group*/
function ReefCutter_ShowGroup(transferNode) 
{
	/*Loop through each mesh in the TransformNode to find their extents relative to the transferNode*/
	var childMeshes 	= transferNode.getChildMeshes();
	
	if (childMeshes !== null) 
	{
		childMeshes.forEach(mesh =>
		{
			mesh.isVisible 		= true;
		});
	}
}

/*Hide group*/
function ReefCutter_HideGroup(transferNode) 
{
	var childMeshes 	= transferNode.getChildMeshes();
	
	if (childMeshes !== null) 
	{
		childMeshes.forEach(mesh =>
		{
			mesh.isVisible 		= false;
		});
	}
}

/*Show ground and whole reletive to eachother*/
function ReefCutter_Path(showHidePath)
{
	if (showHidePath === 1)
	{
		/*var box = {
			width: 					3.2,
			height: 				3.8,
			depth: 					0.6
		};

		var frontSide 			= BABYLON.MeshBuilder.CreateBox("frontSide+", 	{width: box.width, height: box.height, depth: 0.01}, scene);
		var backSide  			= BABYLON.MeshBuilder.CreateBox("backSide+", 	{width: box.width, height: box.height, depth: 0.01}, scene);
		var leftSide  			= BABYLON.MeshBuilder.CreateBox("leftSide+", 	{width: box.depth, height: box.height, depth: 0.01}, scene);
		var rightSide  			= BABYLON.MeshBuilder.CreateBox("rightSide+",	{width: box.depth, height: box.height, depth: 0.01}, scene);

		frontSide.position 		= new BABYLON.Vector3(0 			+ oldValues[0]/2, -0.15 + oldValues[1]/2, box.depth/2 	+ oldValues[2]/2);
		backSide.position 		= new BABYLON.Vector3(0 			+ oldValues[0]/2, -0.15 + oldValues[1]/2, -box.depth/2 	+ oldValues[2]/2);
		leftSide.position 		= new BABYLON.Vector3(-box.width/2 	+ oldValues[0]/2, -0.15 + oldValues[1]/2, 0				+ oldValues[2]/2);
		rightSide.position 		= new BABYLON.Vector3(box.width/2 	+ oldValues[0]/2, -0.15 + oldValues[1]/2, 0				+ oldValues[2]/2);
		
		frontSide.material 		= pathSemiMat;
		backSide.material 		= pathSemiMat;
		leftSide.material 		= pathSemiMat;
		rightSide.material 		= pathSemiMat;
		
		frontSide.rotation.y 	= Math.PI;
		leftSide.rotation.y 	= -Math.PI/2;
		rightSide.rotation.y 	= Math.PI/2;
		
		pivotCube				= BABYLON.MeshBuilder.CreateBox("pivotCube+", {size: 0.1}, scene);
		pivotCube.material 		= pivotMat;
		
		var movementX 			= new Array(100).fill(0);
		var movementY 			= new Array(100).fill(0);
		var movementZ 			= new Array(100).fill(0);
		
		var movements			= [0,0,0,0,0,0,0,0];
		
		let changeX;
		let changeY;
		let changeZ;
		
		movements[0]			= box.width*Math.cos(BABYLON.Tools.ToRadians(-oldValues[5]));
		movements[1]			= box.width*Math.sin(BABYLON.Tools.ToRadians(-oldValues[5]));
		movements[2]			= 0.75*Math.cos(BABYLON.Tools.ToRadians(oldValues[5]));
		movements[3]			= 0.75*Math.sin(BABYLON.Tools.ToRadians(oldValues[5]));
		
		movements[4]			= box.width	- movements[0];
		movements[5]			= box.width - movements[1];
		movements[6]			= 0.75 		- movements[2];
		movements[7]			= 0.75 		- movements[3];
		
		changeY					= movements[4] + movements[3];	
		changeX					= movements[1] + movements[6];
		
		const distX				= Math.sqrt(0.75**2 + changeY**2 + changeX**2);
		const distX2			= Math.sqrt(changeY**2 + changeX**2);
		var angleX 				= Math.PI/2 - Math.atan((changeY+0.75)/changeX);
		
		movements[0]			= box.depth*Math.cos(BABYLON.Tools.ToRadians(oldValues[3]));
		movements[1]			= box.depth*Math.sin(BABYLON.Tools.ToRadians(oldValues[3]));
		movements[2]			= 0.75*Math.cos(BABYLON.Tools.ToRadians(oldValues[3]));
		movements[3]			= 0.75*Math.sin(BABYLON.Tools.ToRadians(oldValues[3]));
		
		movements[4]			= box.depth	- movements[0];
		movements[5]			= box.depth - movements[1];
		movements[6]			= 0.75 		- movements[2];
		movements[7]			= 0.75 		- movements[3];
		
		changeY					= movements[4] + movements[3];	
		changeZ					= movements[1] + movements[6];	
		
		const distY				= Math.sqrt(0.75**2 + changeY**2 + changeZ**2);
		const distY2			= Math.sqrt(changeY**2 + changeZ**2); 
		var angleY 				= Math.PI/2 - Math.atan((changeY+0.75)/changeZ);
		
		for (i = 1; i < 101; i++)
		{
			pathPivot[i - 1]				= scene.getMeshById("pivotCube+").clone("pivotCube+"+i);
			
			pathGroup[i - 1] 				= new BABYLON.TransformNode("pathGroup+"+i, scene);
			pathGroup[i - 1].scaling.y		= 0.1974;
			
			pathLeft[i - 1] 				= scene.getMeshById("leftSide+").clone("leftSide+"+i);
			pathFront[i - 1] 				= scene.getMeshById("frontSide+").clone("frontSide+"+i);
			pathRight[i - 1] 				= scene.getMeshById("rightSide+").clone("rightSide+"+i);
			pathBack[i - 1] 				= scene.getMeshById("backSide+").clone("frontSide+"+i);
			
			pathLeft[i - 1].parent 			= pathGroup[i - 1];
			pathFront[i - 1].parent 		= pathGroup[i - 1];
			pathRight[i - 1].parent			= pathGroup[i - 1];
			pathBack[i - 1].parent			= pathGroup[i - 1];
			
			pathGroup[i - 1].parent			= pathPivot[i - 1];
			
			pathPivot[i - 1].position		= new BABYLON.Vector3(0,1.4,0);
			pathPivot[i - 1].rotate(BABYLON.Axis.X, BABYLON.Tools.ToRadians(oldValues[3]*i), BABYLON.Space.Local);
			pathPivot[i - 1].rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(oldValues[4]*i), BABYLON.Space.Local);
			pathPivot[i - 1].rotate(BABYLON.Axis.Z, BABYLON.Tools.ToRadians(oldValues[5]*i), BABYLON.Space.Local);
			
			if (Math.abs(oldValues[3]) > 0)
			{
				if (angleY < 1.57)
				{
					movementY[i - 1]			= distY*Math.cos(angleY*i)
					movementZ[i - 1]			= distY*Math.sin(angleY*i);
				
					if (i > 1)
					{
						movementY[i - 1]			+= movementY[i - 2] - 0.75;
						movementZ[i - 1]			+= movementZ[i - 2];
					}	
				}
				else
				{
					angleY 						= angleY - Math.PI;
					
					movementY[i - 1]			= distY*Math.cos(angleY*i)
					movementZ[i - 1]			= distY*Math.sin(angleY*i);
				
					if (i > 1)
					{
						movementY[i - 1]			-= movementY[i - 2] - 0.75;
						movementZ[i - 1]			-= movementZ[i - 2];
					}	
				}
				
				pathPivot[i - 1].position.y+= movementY[i - 1];
				pathPivot[i - 1].position.z+= movementZ[i - 1];
			}
			
			if (Math.abs(oldValues[5]) > 0)
			{
				if (angleX < 1.57)
				{
					movementY[i - 1]			= distX*Math.cos(angleX*i)
					movementX[i - 1]			= distX*Math.sin(angleX*i);
				
					if (i > 1)
					{
						movementY[i - 1]			+= movementY[i - 2] - 0.75;
						movementX[i - 1]			+= movementX[i - 2];
					}	
				}
				else
				{
					angleX 						= angleX - Math.PI;
					
					movementY[i - 1]			= distX*Math.cos(angleX*i)
					movementX[i - 1]			= distX*Math.sin(angleX*i);
				
					if (i > 1)
					{
						movementY[i - 1]			-= movementY[i - 2] - 0.75;
						movementX[i - 1]			-= movementX[i - 2];
					}	
				}
				
				pathPivot[i - 1].position.y+= movementY[i - 1];
				pathPivot[i - 1].position.x+= movementX[i - 1];
			}
			
			pathPivot[i - 1].position.y	+= 0.75*(i - 1);
		}*/
		
		/*If there are no movements added*/
		/*if (pathPivot[0].position.y === 1.4)
		{
			for (i = 0; i < pathPivot.length; i++)
			{
				pathPivot[i].position.y 	+= 0.75;
			}
		}
		else if (Math.abs(pathPivot[0].position.y - 2.9) < 0.01)
		{
			for (i = 0; i < pathPivot.length; i++)
			{
				pathPivot[i].position.y 	-= 0.75;
			}
		}*/
		
		var box = {
			width: 					3.2,
			height: 				3.8,
			depth: 					0.6
		};

		var frontSide 			= BABYLON.MeshBuilder.CreateBox("frontSide+", 	{width: box.width, height: box.height, depth: 0.01}, scene);
		var backSide  			= BABYLON.MeshBuilder.CreateBox("backSide+", 	{width: box.width, height: box.height, depth: 0.01}, scene);
		var leftSide  			= BABYLON.MeshBuilder.CreateBox("leftSide+", 	{width: box.depth, height: box.height, depth: 0.01}, scene);
		var rightSide  			= BABYLON.MeshBuilder.CreateBox("rightSide+",	{width: box.depth, height: box.height, depth: 0.01}, scene);

		frontSide.position 		= new BABYLON.Vector3(0 			+ holePath[0][0]/2, -1.9 + holePath[0][1]/2, box.depth/2 	+ holePath[0][2]/2);
		backSide.position 		= new BABYLON.Vector3(0 			+ holePath[0][0]/2, -1.9 + holePath[0][1]/2, -box.depth/2 	+ holePath[0][2]/2);
		leftSide.position 		= new BABYLON.Vector3(-box.width/2 	+ holePath[0][0]/2, -1.9 + holePath[0][1]/2, 0				+ holePath[0][2]/2);
		rightSide.position 		= new BABYLON.Vector3(box.width/2 	+ holePath[0][0]/2, -1.9 + holePath[0][1]/2, 0				+ holePath[0][2]/2);
		
		frontSide.material 		= groundMaterial;
		backSide.material 		= groundMaterial;
		leftSide.material 		= groundMaterial;
		rightSide.material 		= groundMaterial;
		
		leftSide.rotation.y 	= -Math.PI/2;
		rightSide.rotation.y 	= Math.PI/2;
		
		pivotCube				= BABYLON.MeshBuilder.CreateBox("pivotCube+", {size: 0.1}, scene);
		pivotCube.material 		= pivotMat;
		
		var totalStrokes		= 0;
		var semiStrokeDist				= 0;
			
		for (i = 0; i < holePath.length - 1; i++)
		{
			var changeX 					= holePath[i][0] - holePath[i + 1][0];
			var changeY 					= holePath[i][2] - holePath[i + 1][2];
			var changeZ 					= holePath[i][1] - holePath[i + 1][1];
			var distance					= Math.sqrt(changeX**2 + changeY**2 + changeZ**2);
			
			var strokes 					= Math.round(distance/0.75);
					
			for (j = 0; j <= strokes; j++)
			{
				pathPivot[totalStrokes]					= scene.getMeshById("pivotCube+").clone("pivotCube+"+totalStrokes);
				pathGroup[totalStrokes] 				= new BABYLON.TransformNode("pathGroup+"+totalStrokes, scene);
				
				if (j === strokes)
				{
					pathGroup[totalStrokes].scaling.y		= 0.1974*(distance - strokes*0.75)/0.75;
					semiStrokeDist						   += 0.75 - (distance - 0.75*(strokes));
				}
				else
				{
					pathGroup[totalStrokes].scaling.y		= 0.1974;
				}
				
				pathLeft[totalStrokes] 					= scene.getMeshById("leftSide+").clone("leftSide+"+totalStrokes);
				pathFront[totalStrokes] 				= scene.getMeshById("frontSide+").clone("frontSide+"+totalStrokes);
				pathRight[totalStrokes] 				= scene.getMeshById("rightSide+").clone("rightSide+"+totalStrokes);
				pathBack[totalStrokes] 					= scene.getMeshById("backSide+").clone("frontSide+"+totalStrokes);
				
				pathLeft[totalStrokes].parent 			= pathGroup[totalStrokes];
				pathFront[totalStrokes].parent 			= pathGroup[totalStrokes];
				pathRight[totalStrokes].parent			= pathGroup[totalStrokes];
				pathBack[totalStrokes].parent			= pathGroup[totalStrokes];
				
				pathGroup[totalStrokes].parent			= pathPivot[totalStrokes];
				pathPivot[totalStrokes].position		= new BABYLON.Vector3(0,0,0);
				pathPivot[totalStrokes].position.y	   += 0.75*(totalStrokes) - 1.5 - semiStrokeDist;
				totalStrokes				   		   += 1;
				
				var point1 								= new BABYLON.Vector3(holePath[i][0],holePath[i][2],holePath[i][1]);
				var point2 								= new BABYLON.Vector3(holePath[i + 1][0],holePath[i + 1][2],holePath[i + 1][1]);

				let direction 							= point2.subtract(point1);
				direction 								= direction.normalize()

				let rotation 							= BABYLON.Vector3.RotationFromAxis(direction, BABYLON.Axis.Y);
				let angleX 								= Math.atan2(-rotation.z, rotation.y);
				let angleY 								= Math.atan2(-rotation.x, rotation.z);
				let angleZ 								= Math.atan2(-rotation.y, rotation.x);

				pathGroup.rotation.x 					= angleX;
				pathGroup.rotation.y 					= angleY;
				pathGroup.rotation.z 					= angleZ;
			}
		}
	}
	else
	{	
		var deleteSpots 		= [];

		for (i = 0; i < scene.meshes.length; i++) 
		{
			if ((scene.meshes[i].name.includes("+")) || (scene.meshes[i].name.includes("#")))
			{
				deleteSpots.push(i);
			}
		}
		
		for (i = deleteSpots.length - 1; i > -1; i--) 
		{
			var mesh 				= scene.meshes[deleteSpots[i]];
			scene.removeMesh(mesh);
			mesh.dispose();
		}
	}
}

/*Draw lines that indicate how the machine has progressed (to be added to SLAM)*/
function ReefCutter_HolePath()
{
	var iDots					= 0;
	
	holePath.forEach(holeDot =>
	{
		Dots.push(BABYLON.MeshBuilder.CreateSphere("Dots"+(iDots + 1), {diameter: 0.1}, scene));
		Dots[iDots].position		= new BABYLON.Vector3(-1*holePath[iDots][0],holePath[iDots][2],holePath[iDots][1]);
		iDots				  	   += 1;
		
		if (iDots > 1)
		{
			Lines.push(BABYLON.MeshBuilder.CreateLines("line", {points: [Dots[iDots - 1].position, Dots[iDots - 2].position]}, scene));
		}
	});
}

/*Align the groups*/
function ReefCutter_AlignGroup()
{
	groupAll.position.y	= groupAll.position.y - 1.775;
	
	assnAll				= true;
}