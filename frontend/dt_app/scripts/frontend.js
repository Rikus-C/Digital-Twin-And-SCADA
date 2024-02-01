/*Declare the canvas engine, and scene outside of window event to reference if needed*/
let canvas;
let engine;
let scene;
let background;

/*Contains the names and default settings of meshes*/
var selectedMeshesNames		= [];
var selectedMeshesPos		= [];
var selectedMeshesRot		= [];
var selectedMeshesScl		= [];
var deselectedMeshesNames	= [];

var selectAll				= false;

/*Contains the data of new parts not yet assoicted with models*/
var newPart 				= [];
var newPartNames 			= [];
var newPartColor			= [];

/*Contains the data of new models*/
var newModel        		= [];
var newModelNames 			= [];
var newModelColor			= [];
var newModelText			= [];
var newModelGroup			= [];
	
/*Contains the data of the loaded models (to be able to revert)*/
var loadPositions    		= [];
var loadRotations 			= [];
var loadScaling				= [];
var loadColor				= [];

/*Swap between camera moving and mesh moving*/
var cameraMoveEnable 		= true;

/*The cameraSnap is used to move a mesh back to its original position x/y/z axis*/
var cameraSnap 				= false;

/*Move camera based on model*/
var cameraPos				= [];
var cameraTar				= [];

/*Move speed determines the speed at which the meshes are moved/rotate, 1unit-5units or 1°-5°*/
var moveSpeed 				= 0.1;

/*List of mesh posible movements*/
var meshUp 					= false;
var meshDown 				= false;
var meshLeft 				= false;
var meshRight 				= false;
var meshIn 					= false;
var meshOut 				= false;

var meshUpRotate 			= false;
var meshDownRotate			= false;
var meshLeftRotate 			= false;
var meshRightRotate 		= false;
var meshInRotate 			= false;
var meshOutRotate 			= false;

var meshScaleUp				= false;
var meshScaleDown			= false;
var meshScaleHeld			= false;

var listedParts				= [];
var listedModels			= [];
var listedColors			= [];
var listedColorsValues		= [];

/*The meshSnap is used to move a mesh back to its original position if moved (only 1 at a time)*/
var meshSnap 				= false;

/*These variables are used to set and reset the event listeners, thus only one action at a time is processed*/
var newCameraMove 			= false;
var newMeshMove 			= false;

/*Hold the raw config data used for the model*/
var newConfig				= {};

/*Save the specific model selected*/
var newSpec 				= "";

/*Variable to show/hide the menu bar and general information*/
var showMenu				= false;
var showGeneral				= false;
var showChart				= false;
var showTitle				= true;

/*Deselect value for touch pad compatibility*/
var meshSelect				= false;
var infoSelect				= false;

/*Limit operator functions and load model auto*/
var Operator				= false;

/*Remove controls while rendering*/
var renderComplete 			= true;
var renderCount				= 0;

/*The number of meshes that should be on the screen*/
var renderMeshes 			= 0;

/*If model is reloaded, check the selected/deselected*/
var modelReload				= false;

/*Variable to determine if it is the initial model load, helps with part info request*/
var modelInit				= true;

/*Screen changes depending on the application*/
var screenAR				= "";

/*Check for the default models, all models and parts at the beginning only*/
var defaultInit 			= false;

/*If the initial call is for the model or part*/
var partModelCall			= false;

/*If true display data if false display errors*/
var dataErrorSelect			= true;

/*Range selector for replay*/
var rangeOne; 
var rangeTwo;
var rangeThree;
var outputOne;
var outputTwo;
var outputThree;
var inclRange;
var minDelta;
var maxDelta;

/*Replay state, slowest to fastest*/
var replayState 			= 0;
var replaySpeed				= 1;

/*If false new data is played*/
var replaying				= false; 
var replayForward			= true; 

/*When loading the frontend*/
window.addEventListener('DOMContentLoaded', function()
{
	canvas 								= document.getElementById('canvas');
	engine								= new BABYLON.Engine(canvas, true);

	var createScene 					= function()
	{
		/*Scene background is set to MDG logo colour top*/
		var scene 							= new BABYLON.Scene(engine);
		scene.clearColor					= new BABYLON.Color3.FromHexString("#1A4584");
		camera 								= new BABYLON.ArcRotateCamera('camera1', BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(45), 1000.0, new BABYLON.Vector3(0, 0, 0), scene);
		
		camera.setTarget(new BABYLON.Vector3.Zero());
		camera.setPosition(new BABYLON.Vector3(10, 10, 75));
		camera.attachControl(canvas,true);
		
		var light 							= new BABYLON.HemisphericLight('light-1', new BABYLON.Vector3(0, 20, 0), scene);
		var background 						= new BABYLON.Layer("background", "./css/HMI_Background.jpg", scene, true);
		var selectedMesh 					= null;
		
		/*Add event listeners that change a mesh's colour to green when selected and dark MDG logo colour bottom when deselected*/
		scene.onPointerObservable.add((evt) =>
		{
			/*If clicked on a mesh, and hit a mesh*/
			if ((evt.pickInfo.hit && evt.pickInfo.pickedMesh))
			{
				/*If the clicked mesh is not parth of a the Reef or Future path*/
				if ((evt.pickInfo.pickedMesh.id.indexOf("+") === -1) && (evt.pickInfo.pickedMesh.id.indexOf("#") === -1))
				{
					/*If left clicked on mouse or screen clicked while in select mode*/
					if (evt.event.button === 0 && meshSelect)
					{
						/*Get the data of the selected mesh*/
						selectedMesh 						= evt.pickInfo.pickedMesh;
						selectedMesh.id 					= selectedMesh.idname;
						selectedMesh.material.diffuseColor 	= new BABYLON.Color3.Green();
						selectedMesh.material.albedoColor 	= new BABYLON.Color3.Green();
						
						var index 							= selectedMeshesNames.indexOf(selectedMesh.id);
						
						/*If the mesh is not already selected add to the array of selected meshes*/
						if (index === -1)
						{
							/*Add mesh to list of selected meshes*/
							selectedMeshesNames.push(selectedMesh.id);
							
							/*The pos,rot and scl arrays are used to reset the mesh with the meshSnap feature*/
							var posArr 							= [];
							posArr.push(selectedMesh.position.x);
							posArr.push(selectedMesh.position.y);
							posArr.push(selectedMesh.position.z);
							selectedMeshesPos.push(posArr);
							
							var rotArr 							= [];
							rotArr.push(selectedMesh.rotation.x);
							rotArr.push(selectedMesh.rotation.y);
							rotArr.push(selectedMesh.rotation.z);
							selectedMeshesRot.push(rotArr);
							
							var sclArr 							= [];
							sclArr.push(selectedMesh.scaling.x);
							sclArr.push(selectedMesh.scaling.y);
							sclArr.push(selectedMesh.scaling.z);
							selectedMeshesScl.push(sclArr);	
							
							/*If the operator selected auto pop-up info feature*/
							if (infoSelect)
							{
								/*If the model was selected, display the info for all the selected meshes, we know there is now at least 1*/
								if (newModel.length > 0)
								{
									PartsInfoRequest();
								}
								/*The display data is seen in the model-info, if a model is not selected it would be undefined*/
								else
								{
									Swal.fire('No model selected');
								}	
							}
						}
					}
					/*If right clicked on mouse or screen clicked while in deselect mode*/
					else if (evt.event.button === 2 || !meshSelect)
					{
						/*Get the data of the selected mesh*/
						
						selectedMesh 						= evt.pickInfo.pickedMesh;
						var iMesh 							= selectedMeshesNames.indexOf(selectedMesh.id)
			
						/*Only deselect (change color and remove from list) if the mesh was previously selected*/
						if (iMesh !== -1)
						{
							selectedMesh.material.diffuseColor	= new BABYLON.Color3.FromHexString("#3D4547");
							selectedMesh.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
							
							deselectedMeshesNames.push(selectedMeshesNames[iMesh]);
							selectedMeshesNames.splice(iMesh,1);
							selectedMeshesPos.splice(iMesh,1);
							selectedMeshesRot.splice(iMesh,1);
							selectedMeshesScl.splice(iMesh,1);
						}
					}		
				}
			}

		}, BABYLON.PointerEventTypes.POINTERUP);

		return scene;
	}
	
	scene								= createScene();
	
	/*Initialise the number of meshes that should be rendered*/
	renderMeshes 						= scene.meshes.length;
	
	/*Adjust divs on the body according the landscape or portrait (16:9 only)*/
	Auto_AspectRatio();
	
	/*Register a function to be called before each frame is rendered*/
	scene.registerBeforeRender(function () 
	{
		/*Check if the correct number of meshes are rendered*/
		CheckRender();
	
		/*If the camera was moved*/
		if (newCameraMove === true)
		{	
			moveCamera();
		}
		
		/*If a selected mesh was moved*/
		if (newMeshMove === true)
		{	
			moveMesh();
		}

		/*Check all the model's custom rendering*/
		if (((newSpec === "ReefCutter") && (typeof(ReefCutter_PreRender) !== 'undefined')) && (renderComplete && !modelInit && !modelReload))
		{
			ReefCutter_PreRender();
		}
		else if (((newSpec === "SBS") && (typeof(SBS_PreRender) !== 'undefined')) && (renderComplete && !modelInit && !modelReload))
		{
			SBS_PreRender();
		}
	});

	/*This loop repeats as fast as possible, to render the changes*/
	engine.runRenderLoop(function()
	{
		scene.render();
	});
});

/*Resize event on the window object*/
window.addEventListener('resize', function() 
{
	/*Helps with Ctrl Shft I alot*/
	engine.resize(canvas.clientWidth, canvas.clientHeight);
});

/*Load the default model (for operator use) request*/
function LoadDefaultRequest()
{
	/*Initialising to default values*/
	defaultInit =  true;
	
	Socket.write(
	{
		"type": "Load Default Request",
		"spec":	"",
		"data":	""
	});	
}

/*Load the default data*/
function LoadDefaultResponse(Data)
{
	/*The function is called at the very start before the model or parts list have been checked*/
	if (defaultInit)
	{
		newSpec 	= JSON.parse(Data).Model;
		Operator	= JSON.parse(Data).Operator;
		ModelListRequest();
	}
	/*The function is called after the model and part list has been checked*/
	else
	{
		/*If there are no models or parts*/
		if ((listedModels.length === 0) && (listedParts.length === 0))
		{
			Swal.fire('Models & Parts', 'No models or parts were found.', 'error');
		}
		/*If there is atleast a model and a parts*/
		else ((listedModels.length > 0) && (listedParts.length > 0))
		{
			/*If the start up is in operator mode*/
			if (Operator)
			{
				/*Check if the default model exists*/
				if (listedModels.indexOf(newSpec) > -1)
				{
					showTitle 	= true;
					ShowHideTitle();
			
					/*Initiate the model*/
					modelInit	= true;
					InitModel();	
				}
				else
				{
					Swal.fire('Default model was not found.');
					
					/*Reset the model specification to empty*/
					newSpec 	= "";
				}
			}
			else
			{
				Swal.fire('Engineer mode');
			}
		}	
	}
}

/*Send a request to the Backend to load all model options*/
function ModelListRequest()
{
	Socket.write(
	{
		"type": "Model List Request",
		"spec":	"Models",
		"data":	""
	});
}

/*When the requested modellist is received*/
function ModelListResponse(List)
{
	newList				= List.split("\r\n");
	listedModels.length = 0;
	
	newList.forEach(Model =>
	{
		/*Cut away ".json" from the name*/
		Model 				= Model.substring(0,Model.length - 5);
		listedModels.push(Model);
	})
	
	if (listedModels[0] === "")
	{
		listedModels.length = 0;
	}
	
	/*The model list is check upon the load default (start up push)*/
	if (defaultInit === true)
	{
		PartListRequest();
	}
	/*Used to help with reload, if not default initiated, but model list is still called*/
	else 
	{
		if (listedModels.length === 0)
		{	
			Swal.fire('No models were found.');
			
			if (newPart.length === 0)
			{
				/*No model found an no part already shown*/
				showTitle 								= false;
				ShowHideTitle();
			}
		}
		else
		{
			CallModelDropDown();
		}
	}
}

/*Send a request to the Backend to load all part options*/
function PartListRequest()
{
	Socket.write(
	{
		"type": "Part List Request",
		"spec":	"Parts",
		"data":	""
	});
}

/*When the requested partslist is received*/
function PartListResponse(List)
{
	newList				= List.split("\r\n");
	listedParts.length 	= 0;
	
	newList.forEach(Part =>
	{
		/*Cut away ".glb" from the name*/
		Part 				= Part.substring(0,Part.length - 4);
		listedParts.push(Part);
	})
	
	if (listedParts[0] === "")
	{
		listedParts.length = 0;
	}
	
	/*The part list is check upon the load default (start up push)*/
	if (defaultInit === true)
	{
		/*Continue with the default loading*/
		defaultInit 		= false;
		LoadDefaultResponse("");
	}
	/*Used to help with reload, if not default initiated, but part list is still called*/
	else 
	{
		if (listedParts.length === 0)
		{	
			Swal.fire('No parts were found.');
			
			/*If there are no parts no model can load*/
			showTitle 								= false;
			ShowHideTitle();
		}
		else
		{
			if (partModelCall)
			{
				ModelListRequest();
			}
			else
			{
				CallPartDropDown();
			}
		}
	}
}

/*Initialise the correct model*/
function InitModel()
{	
	if (newSpec === "SBS")
	{
		SBS_Init();
	}
	else if (newSpec === "ReefCutter")
	{
		ReefCutter_Init();
	}
}

/*Send a request to the Backend to load the model data*/
function LoadModelRequest()
{
	Socket.write(
	{
		"type": "Load Model Request",
		"spec":	newSpec,
		"data":	""
	});
}

/*When the requested model is received the model is loaded to the scene, var used for referral in received.js*/
function LoadModelResponse(Config,SceneNum)
{
	newConfig 										= Config;
	
	/*Check if all the parts needed for the model is present*/
	if (CheckModelParts(Config))
	{
		Object.keys(Config).forEach(key =>
		{		
			/*Add spinner while loading*/
			document.getElementById("loader").style.display = "block";
			renderComplete 									= false;
			renderCount 									= 0;
			renderMeshes									= Object.keys(Config).length;
			
			BABYLON.SceneLoader.ImportMesh("", "./models/"+Config[key].filename, "", scene, function (newMeshArray) 
			{
				/*Use to ensure vertices are the same when importing*/
				var positions									= [];
				var normals 									= [];
				var uvs 										= [];

				if (newMeshArray[0].id === "__root__");
				{
					newMeshArray = newMeshArray.splice(1,newMeshArray.length);
				}
			
				for (i = 0; i < newMeshArray.length; i++)
				{
					newMesh 										= newMeshArray[i];
					
					/*Get the number of vertices in the mesh*/
					var numVertices 								= newMesh.getTotalVertices();

					/*Create an array of null values for the UV attribute*/
					var nullUVs 									= new Array(numVertices * 2);
					nullUVs.fill(null);

					/*Set the mesh's UVs to null*/
					newMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, nullUVs);
					
					positions.push(newMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind));
					normals.push(newMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind));
					uvs.push(newMesh.getVerticesData(BABYLON.VertexBuffer.UVKind));
					
					if (newMesh.isAnInstance)
					{
						/*Create a new mesh instance*/
						var newCloneMesh 							= newMesh.sourceMesh.clone("newCloneMesh");

						/*Copy all the relevant info*/
						UpdateCloneAttributes(newCloneMesh, newMesh);
						
						/*Add mesh back to array*/
						newMeshArray[i] = newCloneMesh;
					}
				}
				
				var newMerge 										= BABYLON.Mesh.MergeMeshes(newMeshArray.slice(0,newMeshArray.length), true, true);
				
				newMerge.position 									= new BABYLON.Vector3(Config[key].position.x,Config[key].position.y,Config[key].position.z);
				newMerge.rotation 									= new BABYLON.Vector3(Config[key].rotation.x,Config[key].rotation.y,Config[key].rotation.z);
				newMerge.scaling 									= new BABYLON.Vector3(Config[key].scale,Config[key].scale,Config[key].scale);
				
				if (newMerge.material)
				{
					newMerge.material.diffuseColor 					= new BABYLON.Color3(Config[key].color.r,Config[key].color.g,Config[key].color.b);
					newMerge.material.albedoColor 					= new BABYLON.Color3(Config[key].color.r,Config[key].color.g,Config[key].color.b);
				}
				
				newMerge.id 										= Config[key].name;
				newMerge.idname 									= Config[key].name;
				newMerge.name 										= Config[key].name;
				newMerge.filename 									= Config[key].filename;

				/*The model itself is saved in newModel, the name in newModelNames and the default color is kept seperate, to avoid green/gray being written, keep the color unchanged*/
				newModel.push(newMerge);
				loadPositions.push([newMerge.position.x,newMerge.position.y,newMerge.position.z]);
				loadRotations.push([newMerge.rotation.x,newMerge.rotation.y,newMerge.rotation.z]);
				loadScaling.push([newMerge.scaling.x,newMerge.scaling.y,newMerge.scaling.z]);
				
				newModelNames.push(newMerge.idname);
				
				/*Add to extend list*/
				if (newSpec === "ReefCutter")
				{
					newModelGroup.push(Config[key].group);
				}
				
				if (newMerge.material.diffuseColor)
				{
					newModelColor.push(newMerge.material.diffuseColor);
					loadColor.push([newMerge.material.diffuseColor.r,newMerge.material.diffuseColor.g,newMerge.material.diffuseColor.b]);
				}
				else
				{
					newModelColor.push(newMerge.material.albedoColor);
					loadColor.push([newMerge.material.albedoColor.r,newMerge.material.albedoColor.g,newMerge.material.albedoColor.b]);
				}
			});
		});
		
		LoadModelInfoRequest();		
	}
	else
	{
		Swal.fire("Missing model parts.");
	}
}

/*Check if all the parts the model requires is in the parts list*/
function CheckModelParts(Config)
{
	var Check 	= true;
	
	Object.keys(Config).forEach(key =>
	{		
		partName 	= (Config[key].filename).substring(0,Config[key].filename.length - 4);
		if (listedParts.indexOf(partName) === -1)
		{
			Check 	= false;
		}
	});	
	
	return Check;
}

/*Check if rendering is done for entire model*/
function CheckRender()
{
	/*Remove __root__ meshes*/
	if (scene.meshes.length !== renderMeshes)
	{
		newSceneMeshes 									= [];
		
		scene.meshes.forEach((mesh) =>
		{
			if (mesh.id !== '__root__')
			{
				newSceneMeshes.push(mesh);
			}
		})
		
		scene.meshes 									= newSceneMeshes;
		renderMeshes 									= scene.meshes.length;
		renderCount	 									= 0;
	}
	/*Check a render 20 times first*/
	else if (renderCount < 20)
	{
		renderCount 									+= 1;
	}
	/*If done rendering*/
	else if ((((renderMeshes === scene.meshes.length) && (renderMeshes > 0)) && (renderCount === 20)) && (!renderComplete))
	{
		document.getElementById("loader").style.display = "none";
		renderComplete 									= true;

		if (modelReload)
		{
			selectedMeshesNames.forEach(name =>
			{
				var selMesh = scene.getMeshById(name);
				
				selMesh.material.diffuseColor					= new BABYLON.Color3.Green();
				selMesh.material.albedoColor 					= new BABYLON.Color3.Green();
			})
			
			deselectedMeshesNames.forEach(name =>
			{
				var deselMesh 									= scene.getMeshById(name);
				
				deselMesh.material.diffuseColor					= new BABYLON.Color3.FromHexString("#3D4547");
				deselMesh.material.albedoColor 					= new BABYLON.Color3.FromHexString("#3D4547");
			})	
			modelReload 									= false;
		}
		
		const meshInfo = [];
		scene.meshes.forEach(mesh => {
			const vertexBuffer = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
			const numberOfVertices = vertexBuffer ? vertexBuffer.length / 3 : 0;
			
			meshInfo.push({ name: mesh.name, vertices: numberOfVertices });
		});

		// Sort the meshes in descending order based on the number of vertices
		meshInfo.sort((a, b) => b.vertices - a.vertices);
	}	
}

/*Used to prevent instance mesh overwriting*/
function UpdateCloneAttributes(obj1, obj2) 
{
	/*Loop through all attributes of obj1*/
	for (const key in obj1) 
	{
		/*Check if obj2 has the same attribute*/
		if (obj2.hasOwnProperty(key)) 
		{
			/*Compare the values of the attributes*/
			if (obj1[key] !== obj2[key] && obj2[key] !== undefined) 
			{
				/*Update obj1's attribute value with obj2's if they are different and obj2's is not undefined*/
				obj1[key] = obj2[key];
			}
		}
	}
}

/*Requests the display information of the selected parts*/
function LoadModelInfoRequest()
{
	Socket.write(
	{
		"type": "Load Model Info Request",
		"spec":	newSpec,
		"data":	""
	});		
}

/*Displays the information of the selected parts*/
function LoadModelInfoResponse(Data)
{
	var Info = JSON.parse(Data);

	/*Always call, also acts as a semi initialising function*/
	if (newSpec === "SBS")
	{
		SBS_Info(Info);
	}
	else if (newSpec === "ReefCutter")
	{
		ReefCutter_Info(Info);
	}
		
	/*If I am initiating a model, not reloading the model*/
	if ((modelInit) && (!modelReload))
	{
		var camera 	= scene.activeCamera;
		
		cameraPos 	= Info.Camera.CameraPos;
		camera.setPosition(new BABYLON.Vector3(cameraPos.x, cameraPos.y, cameraPos.z));
		
		cameraTar 	= Info.Camera.CameraTar;
		camera.setTarget(new BABYLON.Vector3(cameraTar.x, cameraTar.y, cameraTar.z));
		
		modelInit 	=  false;
	}
}

/*Show or hide the title*/
function ShowHideTitle() 
{
	var title 		= document.getElementById("title");
	var logo 		= document.getElementById("logo");
	var wC 			= title.offsetWidth/logo.offsetWidth;
	var container 	= document.getElementById("title-container");
	
	/*Show title*/
	if (!showTitle === true)
	{
		document.getElementById("generalButton").style.display 	= "none";
		document.getElementById("menuButton").style.display 	= "none";
		
		container.style.transform 								= "translate(-50%, -50%)";
		container.style.opacity 								= "1";
		
		modelInit 												= true;
		
		if (showMenu)
		{
			ShowHideMenu();
		}
		
		if (showGeneral)
		{
			ShowHideGeneral();
		}
	}
	/*Hide title*/
	else
	{
		document.getElementById("generalButton").style.display 	= "block";
		document.getElementById("menuButton").style.display 	= "block";
	
		container.style.transform 								= "translate(-250%, -50%)";
		container.style.opacity 								= "0";
	}
	
	showTitle	= !showTitle;
}

/*Calls the popup menu when loading a model*/
function CallModelDropDown()
{
	/*If the program started, I then choose some part(s) and then click M, to save the parts to the new Model*/
	if (newPart.length > 0)
	{	
		var newName 							= "";
		Swal.fire(
		{
			title: 									'Enter new model name',
			input: 									'text',
			inputPlaceholder: 						'Type the model name here...',
			allowOutsideClick: 						false,
			inputValidator: 						(value) => 
			{
				if (!value) 
				{
					return 'You must enter a model name!';
				}
				else
				{
					newName 								= value;
				}
			}
		}).then((result) => 
		{
			/*If the name was entered and OK was clicked*/
			if (result.isConfirmed) 
			{
				/*If the name entered is a listed model name, ask for overwrite permission*/
				if (listedModels.indexOf(newName) > -1)
				{
					Swal.fire(
					{
						title: 									'Confirm model overwrite',
						text: 									'You entered: ' + result.value,
						icon: 									'warning',
						showCancelButton: 						true,
						confirmButtonText: 						'Yes, submit it!',
						cancelButtonText: 						'No, cancel!',
						allowOutsideClick: 						false,
						reverseButtons: 						true
					}).then((confirmResult) => 
					{
						/*Overwrite permission given*/
						if (confirmResult.isConfirmed)
						{
							newModelText 							= newName;
							CreateModelRequest();
						} 
						else if (confirmResult.dismiss === Swal.DismissReason.cancel) 
						{
							Swal.fire('Model creation cancelled.');
						}
					});
				}
				else
				{
					newModelText 							= newName;
					CreateModelRequest();	
				}
			}
		});
	}
	/*If the program started, I then click M, to load an existing Model*/
	else if ((newPart.length === 0) && (newModel.length === 0))
	{
		const {value: model} 					= Swal.fire(
		{
			title: 									'Model selection',
			input: 									'select',
			
			inputOptions: 
			{
				...listedModels.reduce((obj, val) => 	({...obj, [val]: val}), {}),
			},
		  
			inputPlaceholder: 						'Select a model',
			showCancelButton: 						true,
			inputValidator: (value) => 
			{
				return new Promise((resolve) => 
				{
					if (value !== '') 
					{
						newSpec 								= value;
						InitModel();
						resolve()
					} 
					else 
					{
						resolve('You need to select a model')
					}
				})
			}
		}).then((result) => 
		{
			/*If I clicked out of the model selection, or cancelled, show title screen again because this menu will only be called if there is no parts or models*/
			if (result.isDismissed)
			{
				showTitle 								= false;
				ShowHideTitle();
			}
		});	
	}
}
	
/*Calls the popup menu when loading a part*/
function CallPartDropDown()
{
	var defaultValue 					= "";
	var enteredValue 					= "";
	
	/*First select a part from the list of GLBs*/
	const {value: part} 				= Swal.fire(
	{
		title: 								'Part selection',
		input: 								'select',
		
		inputOptions: 
		{
			...listedParts.reduce((obj, val) =>	({...obj, [val]: val}), {}),
		},
	  
		inputPlaceholder: 					'Select a part',
		showCancelButton:					true,
		
		inputValidator: 					(value) => 
		{
			return new Promise((resolve) => 
			{
				if (value !== '') 
				{
					resolve()
				} 
				else 
				{
					resolve('You need to select a part')
				}
			})
		}
	}).then((result) => 
	{
		/*If I clicked out of the part selection, or cancelled, and I don't have parts or a model on the screen (have to check because the function can be called at any time), then show title screen again*/
		if ((result.isDismissed) && ((newPart.length === 0) && (newModel.length === 0)))
		{
			showTitle 							= false;
			ShowHideTitle();
		}
		/*If a part was selected, the name must be entered*/
		else if (result.isConfirmed)
		{		
			/*The part file (glb) is the default name without the glb part*/
			defaultValue 						= result.value;
			
			const {value2: partName} 			= Swal.fire(
			{
				title: 								'Enter the part name',
				input: 								'text',
				showCancelButton:					true,
				
				inputValidator: (value2) => 
				{
					enteredValue						= value2;
				}
			}).then((result) =>
			{
				/*If the part name was enetered*/
				if (result.isConfirmed)
				{
					var index 							= newPartNames.indexOf(enteredValue);
					var index2 							= newModelNames.indexOf(enteredValue);
				
					var index3 							= newPartNames.indexOf(defaultValue);
					var index4 							= newModelNames.indexOf(defaultValue);
					
					/*If the part name is already in use by the model, or in use on the screen (new part selected then name entered but not saved)*/
					if ((index > -1) || (index2 > -1))
					{
						Swal.fire('Could not load part\r\nName must be unique');	
					}
					/*If the part name is empty and the default name is already in use by the model, or in use on the screen (new part selected then name entered but not saved)*/
					else if (((index3 > -1) || (index4 > -1)) && (enteredValue === ""))
					{
						Swal.fire('Could not load part\r\nDefault name already in use');	
					}
					else
					{
						/*Make the newPart's name/id and idname the entered text or the defaultValue*/
						if (enteredValue === "")
						{
							LoadPart(defaultValue);
						}
						else
						{
							LoadPart(enteredValue);
						}
					}
				}
			});	
		}
	});
}

/*Load a new part to the scene*/
function LoadPart(partName)
{
	/*Add spinner while loading*/
	document.getElementById("loader").style.display = "block";
	renderComplete 									= false;
	renderCount 									= 0;
	renderMeshes									+= 1;
	
	BABYLON.SceneLoader.ImportMesh("", "./models/"+partName+".glb", "", scene, function (newMeshArray) 
	{
		/*Use to ensure vertices are the same when importing*/
		var positions									= [];
		var normals 									= [];
		var uvs 										= [];
		
		/*Do not add the __root__*/
		if (newMeshArray[0].id === "__root__");
		{
			newMeshArray 									= newMeshArray.splice(1,newMeshArray.length);
		}
		
		for (i = 0; i < newMeshArray.length; i++)
		{
			newMesh 										= newMeshArray[i];
			
			/*Get the number of vertices in the mesh*/
			var numVertices 								= newMesh.getTotalVertices();

			/*Create an array of null values for the UV attribute*/
			var nullUVs 									= new Array(numVertices * 2);
			nullUVs.fill(null);

			/*Set the mesh's UVs to null*/
			newMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, nullUVs);
			
			positions.push(newMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind));
			normals.push(newMesh.getVerticesData(BABYLON.VertexBuffer.NormalKind));
			uvs.push(newMesh.getVerticesData(BABYLON.VertexBuffer.UVKind));
			
			if (newMesh.isAnInstance)
			{
				/*Create a new mesh instance*/
				var newCloneMesh 								= newMesh.sourceMesh.clone("newCloneMesh");

				/*Copy all the relevant info*/
				UpdateCloneAttributes(newCloneMesh, newMesh);
				
				/*Add mesh back to array*/
				newMeshArray[i] 								= newCloneMesh;
			}
		}
		
		/*Merge all the meshes to one thing*/
		var newMerge 									= BABYLON.Mesh.MergeMeshes(newMeshArray.slice(0,newMeshArray.length), true, true)
		
		newMerge.position 								= BABYLON.Vector3.Zero();
		newMerge.rotation 								= BABYLON.Vector3.Zero();
		newMerge.scaling 								= new BABYLON.Vector3(1,1,1);
		
		if (newMerge.material)
		{
			newMerge.material.diffuseColor 					= new BABYLON.Color3(1,1,1);
			newMerge.material.albedoColor 					= new BABYLON.Color3(1,1,1);
		}
		
		newMerge.idname 								= "tempName";
		newMerge.filename 								= partName+".glb";

		/*The part itself is saved in newPart, the name in newPartNames and the default color is kept seperate, to avoid green/gray being written, keep the color unchanged*/
		newPart.push(newMerge);
		newPartNames.push(newMerge.idname);
		
		if (newMerge.material.diffuseColor)
		{
			newPartColor.push(newMerge.material.diffuseColor);
		}
		else
		{
			newPartColor.push(newMerge.material.albedoColor);
		}
		
		newPartNames[newPart.length - 1]				= partName;
		newPart[newPart.length - 1].id					= partName;	
		newPart[newPart.length - 1].idname				= partName;	
		newPart[newPart.length - 1].name				= partName;
	});
}

/*Deletes all the selected meshes*/
function DeleteParts()
{
	/*Check if there are meshes selected to delete*/
	if (selectedMeshesNames.length > 0)
	{	
		Swal.fire({
			title: 						'Do you want to delete the selected parts?',
			showDenyButton: 			true,
			showCancelButton: 			false,
			confirmButtonText: 			'Yes',
			denyButtonText: 			'No',
		}).then((result) => 
		{
			/*If the delete authorised*/
			if (result.isConfirmed) 
			{
				/*If this delete would cause the entire model to delete*/
				if ((newModel.length - Selected_Mesh_Model_Count()) === 0)
				{
					/*Ask permission to delete the whole model*/
					Swal.fire({
						title: 						'Delete model?',
						showDenyButton: 			true,
						showCancelButton: 			false,
						confirmButtonText: 			'Yes',
						denyButtonText: 			'No',
					}).then((result) => 
					{
						/*Delete the entire model*/
						if (result.isConfirmed) 
						{			
							selectedMeshesNames.forEach((key, index) =>
							{
								scene.getMeshById(selectedMeshesNames[index]).dispose();
							});	
							
							/*Delete from the model*/
							selectedMeshesNames.forEach(key =>
							{
								var index 					= newModelNames.indexOf(key);	
								
								newModel.splice(index,1);
								newModelNames.splice(index,1);
								newModelColor.splice(index,1);
							});
					
							/*Clear selected meshes*/
							selectedMeshesNames.length 	= 0;
							selectedMeshesPos.length 	= 0;
							DeleteModelRequest();
						}
					})	
				}
				/*If this delete would not cause the entire model to delete*/
				else
				{
					selectedMeshesNames.forEach((key, index) =>
					{
						scene.getMeshById(selectedMeshesNames[index]).dispose();
					});	
					
					var index1 					= -1;
					var index2 					= -1;
					var checkModel				= false;
					
					/*Delete from the model list or delete from the new parts list*/
					selectedMeshesNames.forEach(key =>
					{
						index1						= newPartNames.indexOf(key);	
						
						if (index1 > -1)
						{
							newPart.splice(index1,1);
							newPartNames.splice(index1,1);
							newPartColor.splice(index1,1);
						}
						
						index2						= newModelNames.indexOf(key);	
						
						if (index2 > -1)
						{
							newModel.splice(index2,1);
							newModelNames.splice(index2,1);
							newModelColor.splice(index2,1);	
							
							/*If a part is deleted from the model, the model must be updated*/
							checkModelUpdate			= true;
						}
					});
			
					/*Clear selected meshes*/
					selectedMeshesNames.length 	= 0;
					selectedMeshesPos.length 	= 0;
					
					/*Check if the model must be updated or if the delete is complete*/
					if (checkModelUpdate)
					{
						UpdateModelRequest();
					}
					else
					{
						Swal.fire('Deleted!', '', 'success');	
					}
					
					/*If this delete has caused their to be no parts left on the screen display the title again*/
					if ((newPart.length === 0) && (newModel.length === 0))
					{
						showTitle 					= false;
						ShowHideTitle();
					}
				}
			} 
			else if (result.isDenied)
			{
				Swal.fire('Parts were not deleted', '', 'info')
			}
		})
		
		renderMeshes 				= newModel.length + newPart.length;
	}
}

/*Selected mesh model count*/
function Selected_Mesh_Model_Count()
{
	var count 	= 0;
	
	/*For all the selected meshes check if the part is part of the model or extra added*/
	selectedMeshesNames.forEach(name =>
	{
		if (newModelNames.indexOf(name) > -1)
		{
			count 		+= 1;
		}
	});
	
	return count;
}

/*Send a request to the Backend to delete the model data*/
function DeleteModelRequest()
{
	Socket.write(
	{
		"type": "Delete Model Request",
		"spec":	newSpec,
		"data":	""
	});	
}

/*When a new model was deleted succesfully clear the variable specifier*/
function DeleteModelResponse()
{
	newSpec = "";
	
	/*If deleting the model causes their to be no parts on screen*/
	if ((newPart.length === 0) && (newModel.length === 0))
	{
		showTitle 	= false;
		ShowHideTitle();
	}
}

/*Camera movements*/
function moveCamera()
{
	/*Snap the camera to an axis*/
	if (cameraSnap === true)
	{
		var camera = scene.activeCamera;
		if (typeof cameraPos.x !== 'undefined')
		{
			camera.setPosition(new BABYLON.Vector3(cameraPos.x, cameraPos.y, cameraPos.z));
		}
		else
		{
			camera.setPosition(new BABYLON.Vector3(0, 0, 75));
		}
		
		if (typeof cameraTar.x !== 'undefined')
		{
			camera.setTarget(new BABYLON.Vector3(cameraTar.x, cameraTar.y, cameraTar.z));
		}
		else
		{
			camera.setTarget(BABYLON.Vector3.Zero());
		}
		
		cameraSnap = false;
	}
	
	/*Enable camera movement*/
	if (cameraMoveEnable === true)
	{
		scene.activeCamera.attachControl(canvas,true);
	}
	/*Disable camera movement*/
	else
	{
		scene.activeCamera.detachControl();
	} 
	
	/*Do not call the moveCamera() function unnessarily*/
	newCameraMove = false;
}

/*Mesh movements*/
function moveMesh()
{
	/*Snap mesh to start position*/
	if (meshSnap === true)
	{
		for (i = 0; i < selectedMeshesNames.length; i ++)
		{
			var mesh		= scene.getMeshById(selectedMeshesNames[i]);
		
			mesh.position.x = selectedMeshesPos[i][0];
			mesh.position.y = selectedMeshesPos[i][1];
			mesh.position.z = selectedMeshesPos[i][2];
			
			mesh.rotation.x = selectedMeshesRot[i][0];
			mesh.rotation.y = selectedMeshesRot[i][1];
			mesh.rotation.z = selectedMeshesRot[i][2];
			
			mesh.scaling.x 	= selectedMeshesScl[i][0];
			mesh.scaling.y 	= selectedMeshesScl[i][1];
			mesh.scaling.z 	= selectedMeshesScl[i][2];
		}
		meshSnap = false;
	}
	/*Increase or decrease the scale of a mesh by a factor of 10*************************change if needed************************************************************/
	else if (meshScaleUp === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).scaling.x = scene.getMeshById(selectedMeshesNames[index]).scaling.x*1.1;
			scene.getMeshById(selectedMeshesNames[index]).scaling.y = scene.getMeshById(selectedMeshesNames[index]).scaling.y*1.1;
			scene.getMeshById(selectedMeshesNames[index]).scaling.z = scene.getMeshById(selectedMeshesNames[index]).scaling.z*1.1;
		});					
		meshScaleUp	= false;
	}
	else if (meshScaleDown === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).scaling.x = scene.getMeshById(selectedMeshesNames[index]).scaling.y*0.9;
			scene.getMeshById(selectedMeshesNames[index]).scaling.y = scene.getMeshById(selectedMeshesNames[index]).scaling.y*0.9;
			scene.getMeshById(selectedMeshesNames[index]).scaling.z = scene.getMeshById(selectedMeshesNames[index]).scaling.z*0.9;
		});					
		meshScaleDown	= false;
	}
	/*Move or rotate mesh according to button pressed*/
	else if (meshLeft === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.x += moveSpeed/5;
		});					
		meshLeft	= false;
	}
	else if (meshRight === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.x -= moveSpeed/5;
		});	
		meshRight	= false;
	}
	else if (meshUp === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.y += moveSpeed/5;
		});
		
		meshUp		= false;
	}
	else if (meshDown === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.y -= moveSpeed/5;
		});
		meshDown		= false;
	}
	else if (meshIn === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.z += moveSpeed/5;
		});
		meshIn		= false;
	}
	else if (meshOut === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).position.z -= moveSpeed/5;
		});
		meshOut		= false;
	}
	else if (meshLeftRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.y += moveSpeed/5,72958;
		});					
		
		meshLeftRotate		= false;
	}
	else if (meshRightRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.y -= moveSpeed/5,72958;
		});	
		meshRightRotate	= false;
	}				
	else if (meshUpRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.x += moveSpeed/5,72958;
		});
		meshUpRotate		= false;
	}
	else if (meshDownRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.x -= moveSpeed/5,72958;
		});
		meshDownRotate		= false;
	}
	else if (meshInRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.z += moveSpeed/5,72958;
		});
		meshInRotate		= false;
	}
	else if (meshOutRotate === true)
	{
		selectedMeshesNames.forEach((key, index) =>
		{
			scene.getMeshById(selectedMeshesNames[index]).rotation.z -= moveSpeed/5,72958;
		});
		meshOutRotate		= false;
	}

	/*Prevents the pre render function from running this unnessarily*/
	newMeshMove = false;
	
	/*Remove floating point errors*/
	RoundAll();
}

/*Round all values to 4 decimals*/
function RoundAll()
{
	/*Values are rounded to 4 decmial places to display better in JSON, also helps with floating point errors*/
	newModel.forEach(mesh =>
	{
		mesh.position.x = Math.round((mesh.position.x)*10000)/10000;
		mesh.position.y = Math.round((mesh.position.y)*10000)/10000;
		mesh.position.z = Math.round((mesh.position.z)*10000)/10000;
		
		mesh.rotation.x = Math.round((mesh.rotation.x)*10000)/10000;
		mesh.rotation.y = Math.round((mesh.rotation.y)*10000)/10000;
		mesh.rotation.z = Math.round((mesh.rotation.z)*10000)/10000;
		
		mesh.scaling.x 	= Math.round((mesh.scaling.x)*10000)/10000;
		mesh.scaling.y 	= Math.round((mesh.scaling.x)*10000)/10000;
		mesh.scaling.z 	= Math.round((mesh.scaling.x)*10000)/10000;
	})
	
	newPart.forEach(mesh =>
	{
		mesh.position.x = Math.round((mesh.position.x)*10000)/10000;
		mesh.position.y = Math.round((mesh.position.y)*10000)/10000;
		mesh.position.z = Math.round((mesh.position.z)*10000)/10000;
		
		mesh.rotation.x = Math.round((mesh.rotation.x)*10000)/10000;
		mesh.rotation.y = Math.round((mesh.rotation.y)*10000)/10000;
		mesh.rotation.z = Math.round((mesh.rotation.z)*10000)/10000;
		
		mesh.scaling.x 	= Math.round((mesh.scaling.x)*10000)/10000;
		mesh.scaling.y 	= Math.round((mesh.scaling.x)*10000)/10000;
		mesh.scaling.z 	= Math.round((mesh.scaling.x)*10000)/10000;
	})
}

/*Send a request to the Backend to update the model data*/
function UpdateModelRequest()
{	
	/*If a model is actively displaying*/
	if (newSpec !== "")
	{
		/*Create a string to update the config data in the backend*/
		var ConfigData 							= "{";
		
		/*Update the values in the new model before updating, to account for currently selected, not yet deselected*/
		selectedMeshesNames.forEach(key =>
		{
			var index 								= newModelNames.indexOf(key);
			
			if (index > -1)
			{
				newModel[index].position				= scene.getMeshById(key).position;
				newModel[index].rotation				= scene.getMeshById(key).rotation;
				newModel[index].scaling					= scene.getMeshById(key).scaling;
				newModel[index].material.diffuseColor	= scene.getMeshById(key).material.diffuseColor;
				newModel[index].material.albedoColor	= scene.getMeshById(key).material.albedoColor;
			}
			
			index 									= newPartNames.indexOf(key);
			
			if (index > -1)
			{
				newPart[index].position					= scene.getMeshById(key).position;
				newPart[index].rotation					= scene.getMeshById(key).rotation;
				newPart[index].scaling					= scene.getMeshById(key).scaling;
				newPart[index].material.diffuseColor	= scene.getMeshById(key).material.diffuseColor;
				newPart[index].material.albedoColor		= scene.getMeshById(key).material.albedoColor;
			}
		});
		
		/*If I am working with the Reefcutter put the rods in their original positions, not the pivots*/
		if (newSpec === "ReefCutter")
		{
			var indexTL 							= newModelNames.indexOf("(ReefCutter) rbs-tc-160-ca-00 l bar");
			var indexTR 							= newModelNames.indexOf("(ReefCutter) rbs-tc-160-ca-00 r bar");
			var indexBL 							= newModelNames.indexOf("(ReefCutter) rbs-tc-190-ca-00 l bar");
			var indexBR 							= newModelNames.indexOf("(ReefCutter) rbs-tc-190-ca-00 r bar");
		
			newModel[indexTL].position				= new BABYLON.Vector3(loadPositions[indexTL][0],loadPositions[indexTL][1],loadPositions[indexTL][2]);
			newModel[indexTR].position				= new BABYLON.Vector3(loadPositions[indexTR][0],loadPositions[indexTR][1],loadPositions[indexTR][2]);
			newModel[indexBL].position				= new BABYLON.Vector3(loadPositions[indexBL][0],loadPositions[indexBL][1],loadPositions[indexBL][2]);
			newModel[indexBR].position				= new BABYLON.Vector3(loadPositions[indexBR][0],loadPositions[indexBR][1],loadPositions[indexBR][2]);
		
			groupCylTL.parent						= null;
			groupCylTR.parent						= null;
			groupCylBL.parent						= null;
			groupCylBR.parent						= null;	
		}
		
		/*Use the raw config data to ensure the objects are in the correct order*/
		Object.keys(newConfig).forEach(key =>
		{
			var index 								= newModelNames.indexOf(newConfig[key].name);
			
			/*Will not check for the deleted parts*/
			if (index > -1)
			{	
				ConfigData 								= ConfigData+'"'+newModel[index].idname+'":{'+
															'"name":"'+newModel[index].idname+'",'+
															'"filename":"'+newModel[index].filename+'",'+
															'"scale":'+newModel[index].scaling.x+','
															+'"position":{'+
																'"x":'+newModel[index].position.x+','+
																'"y":'+newModel[index].position.y+','+
																'"z":'+newModel[index].position.z+
															'},'
															+'"rotation":{'+
																'"x":'+newModel[index].rotation.x+','+
																'"y":'+newModel[index].rotation.y+','+
																'"z":'+newModel[index].rotation.z+
															'},'+
															'"color":{'+
																'"r":'+newModelColor[index].r+','+
																'"g":'+newModelColor[index].g+','+
																'"b":'+newModelColor[index].b+
															'}';	
				/*If the model uses group data, add these values*/
				if (newSpec === "ReefCutter")
				{
					ConfigData 								= ConfigData+
																',"group":"'+newModelGroup[index]+'"';	
				}
				
				ConfigData 								= ConfigData+"},";
			}
			
		});
		
		for (i = 0; i < newPart.length; i++)
		{
			ConfigData 								= ConfigData+'"'+newPart[i].idname+'":{'+
														'"name":"'+newPart[i].idname+'",'+
														'"filename":"'+newPart[i].filename+'",'+
														'"scale":'+newPart[i].scaling.x+','+
														'"position":{'+
															'"x":'+newPart[i].position.x+','+
															'"y":'+newPart[i].position.y+','+
															'"z":'+newPart[i].position.z+
														'},'+
														'"rotation":{'+
															'"x":'+newPart[i].rotation.x+','+
															'"y":'+newPart[i].rotation.y+','+
															'"z":'+newPart[i].rotation.z+
														'},'+
														'"color":{'+
															'"r":'+newPartColor[i].r+','+
															'"g":'+newPartColor[i].g+','+
															'"b":'+newPartColor[i].b+
														'}';

			/*New parts of the ReefCutter do not have a specific group*/				
			if (newSpec === "ReefCutter")
			{
				ConfigData 								= ConfigData+',"group":"none",';
			}
			
			ConfigData 								= ConfigData+"},";
		}
		
		ConfigData								= ConfigData.substring(0,ConfigData.length - 1)+"}";
		
		Socket.write(
		{
			"type": 								"Update Model Request",
			"spec":									newSpec,
			"data":									ConfigData
		});		
	}
	/*If a model is not actively and I click update, call the model dropdown, thus M and U has the same result, if there are parts but no model*/
	else
	{
		CallModelDropDown();
	}
}

/*Send a request to the Backend to load the model data*/
function ClearDeselectedMeshes()
{
	/*Clear the deselected meshes, if check for model specified colors, new colors and then use default*/
	deselectedMeshesNames.forEach(name =>
	{
		var mesh 					= scene.getMeshById(name);
		
		var index 					= newModelNames.indexOf(name);
	
		if (index > -1)
		{
			mesh.material.diffuseColor 	= newModelColor[index];
			mesh.material.albedoColor 	= newModelColor[index];
		}
		else
		{
			index 						= newPartNames.indexOf(name);
			
			/*Color was specified in app, not in model*/
			if (index > -1)
			{
				mesh.material.diffuseColor 	= newPartColor[index];
				mesh.material.albedoColor 	= newPartColor[index];
			}
			else
			{
				mesh.material.diffuseColor 	= new BABYLON.Color3(1,1,1);
				mesh.material.albedoColor 	= new BABYLON.Color3(1,1,1);
			}	
		}
	});

	deselectedMeshesNames 		= [];
}

/*Send a request to the Backend to load all part options*/
function ColorListRequest()
{
	Socket.write(
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
	else
	{
		CallColorDropDown();
	}
}

/*Calls the popup menu when loading a part*/
function CallColorDropDown()
{
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
				var index 										= listedColors.indexOf(result.value);
			
				selectedMeshesNames.forEach(name =>
				{
					scene.getMeshById(name).material.diffuseColor 	= new BABYLON.Color3.FromHexString(listedColorsValues[index]);
					scene.getMeshById(name).material.albedoColor 	= new BABYLON.Color3.FromHexString(listedColorsValues[index]);
					
					var index2 										= newModelNames.indexOf(name);
				
					if (index2 > -1)
					{
						newModelColor[index2]							= new BABYLON.Color3.FromHexString(listedColorsValues[index]);
					}
					
					index2 	= newPartNames.indexOf(name);
				
					if (index2 > -1)
					{
						newPartColor[index2]							= new BABYLON.Color3.FromHexString(listedColorsValues[index]);
					}
				})	
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
								selectedMeshesNames.forEach(name =>
								{
									
									scene.getMeshById(name).material.diffuseColor 	= new BABYLON.Color3.FromHexString('#'+value2);
									scene.getMeshById(name).material.albedoColor 	= new BABYLON.Color3.FromHexString('#'+value2);
									
									var index2 										= newModelNames.indexOf(name);
								
									if (index2 > -1)
									{
										newModelColor[index2]						= new BABYLON.Color3.FromHexString('#'+value2);
									}
									
									index2 	= newPartNames.indexOf(name);
								
									if (index2 > -1)
									{
										newPartColor[index2]						= new BABYLON.Color3.FromHexString('#'+value2);
									}
								})	
								
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
}

/*Calls the popup menu for selecting a predifined zoom factor*/
function CallScalingOptions()
{	
	/*Assign to a specific scaling value*/
	const {value: part} 								= Swal.fire(
	{
		title: 												'Scale selection',
		input: 												'select',
		
		inputOptions: 
		{
			0.01 	: 											0.01,
			0.025 	: 											0.025,
			0.05 	: 											0.05,
			0.1		: 											0.1,
			0.25 	: 											0.25,
			0.5 	: 											0.5,
			1 		: 											1,
			2.5 	: 											2.5,
			5 		: 											5,
			10 		: 											10,
			25 		: 											25,
			50 		: 											50,
			100 	: 											100,
		},
	  
		inputPlaceholder: 									'Select a scaling factor',
		showCancelButton:									true,
		
		inputValidator: (value) => 
		{
			return new Promise((resolve) => 
			{
				if (value !== '') 
				{
					selectedMeshesNames.forEach(key =>
					{
						var index 											= newModelNames.indexOf(key);
						
						if (index > -1)
						{
							scene.getMeshById(selectedMeshesNames[0]).scaling 	= new BABYLON.Vector3(Number(value),Number(value),Number(value));
							newModel[index].scaling 							= new BABYLON.Vector3(Number(value),Number(value),Number(value));
						}
						
						index = newPartNames.indexOf(key);
						
						if (index > -1)
						{
							scene.getMeshById(selectedMeshesNames[0]).scaling 	= new BABYLON.Vector3(Number(value),Number(value),Number(value));
							newPart[index].scaling 								= new BABYLON.Vector3(Number(value),Number(value),Number(value));
						}
					});

					resolve()
				} 
				else 
				{
					resolve('You need to select a scaling factor')
				}
			})
		}
	});
}

/*Send a request to the Backend to create the model data*/
function CreateModelRequest()
{
	/*Create a string to update the config data in the backend*/
	var ConfigData 	= "{";
	
	for (i = 0; i < newPart.length; i++)
	{
		ConfigData 		= ConfigData+'"'+newPart[i].idname+'":{'+
							'"name":"'+newPart[i].idname+'",'+
							'"filename":"'+newPart[i].filename+'",'+
							'"scale":'+newPart[i].scaling.x+','+
							'"position":{'+
								'"x":'+newPart[i].position.x+','+
								'"y":'+newPart[i].position.y+','+
								'"z":'+newPart[i].position.z+
							'},'+
							'"rotation":{'+
								'"x":'+newPart[i].rotation.x+','+
								'"y":'+newPart[i].rotation.y+','+
								'"z":'+newPart[i].rotation.z+
							'},'+
							'"color":{'+
								'"r":'+newPartColor[i].r+','+
								'"g":'+newPartColor[i].g+','+
								'"b":'+newPartColor[i].b+
							'}},';
	}
	
	ConfigData		= ConfigData.substring(0,ConfigData.length - 1) + "}";
	
	/*Send a write instruction to the backend*/
	Socket.write(
	{
		"type": 		"Create Model Request",
		"spec":			newModelText,
		"data":			ConfigData
	});	
}

/*When creating a new model set the specification as well*/
function CreateModelResponse()
{
	/*If the model was created assign the model text and then call that model*/
	newSpec 			= newModelText;
	
	/*Reload model file, removes all the meshes from the screen and then reload the model file*/
	newModelNames.forEach(name =>
	{
		scene.getMeshById(name).dispose();
	})

	/*Contains the data of new models*/
	newModel        		= [];
	newModelNames 			= [];
	newModelColor			= [];
	newModelText			= [];
	
	/*Contains the data of new parts*/
	newPart 				= [];
	newPartNames 			= [];
	newPartColor			= [];
	
	/*Contains the data of the loaded models (to be able to revert)*/
	loadPositions    		= [];
	loadRotations 			= [];
	loadScaling				= [];
	loadColor				= [];
	
	LoadModelRequest();
	
	cameraMoveEnable		= true;
}

/*Reload the model data*/
function ReloadModel()
{
	/*Reload model, takes the model values from the first load and populates the model on screen*/
	newModelNames.forEach(meshName =>
	{
		var index 								= newModelNames.indexOf(meshName);
		
		newModel[index].position 				= new BABYLON.Vector3(loadPositions[index][0],loadPositions[index][1],loadPositions[index][2]);
		newModel[index].rotation 				= new BABYLON.Vector3(loadRotations[index][0],loadRotations[index][1],loadRotations[index][2]);
		newModel[index].scaling 				= new BABYLON.Vector3(loadScaling[index][0],loadScaling[index][1],loadScaling[index][2]);
		
		if (newModel[index].material.diffuseColor)
		{
			newModel[index].material.diffuseColor	= new BABYLON.Color3(loadColor[index][0],loadColor[index][1],loadColor[index][2]);
		}
		else
		{
			newModel[index].material.albedoColor 	= new BABYLON.Color3(loadColor[index][0],loadColor[index][1],loadColor[index][2]);
		}
	})
	
	cameraMoveEnable						= true;
}

/*Reload the model data*/
function ReloadModelFile()
{
	/*Reload model file, removes all the meshes from the screen and then reload the model file*/
	newModelNames.forEach(name =>
	{
		scene.getMeshById(name).dispose();
	})

	/*Contains the data of new models*/
	newModel        		= [];
	newModelNames 			= [];
	newModelColor			= [];
	newModelText			= [];
	
	/*Contains the data of the loaded models (to be able to revert)*/
	loadPositions    		= [];
	loadRotations 			= [];
	loadScaling				= [];
	loadColor				= [];
	
	LoadModelRequest();
	
	cameraMoveEnable		= true;
	modelReload				= true;
}

/*Show or hide the bottom menu*/
function ShowHideMenu() 
{
	var div 				= document.getElementById("menuDiv");
	var div2 				= document.getElementById("generalDiv");
	var button				= document.getElementById("menuButton");
	var button2				= document.getElementById("generalButton");
	var br					= document.getElementById("block_br");
	var br2					= document.getElementById("block_br2");
	var bl					= document.getElementById("block_bl");
	var generalSum			= 0;
	var generalButSum2		= 0;
	
	/*Show menu*/
	if (!showMenu)
	{
		div.style.display 		= "block";
		
		if (screenAR === "Landscape")
		{
			button.style.top		= "calc(90% - 102px)";
		}
		else
		{
			button.style.top		= "calc(90% + 27px)";	
		}
		
		button.style.transform 	= "rotate(0deg)";
		
		br.style.bottom			= "123px";
		br2.style.bottom		= "123px";
		bl.style.bottom			= "123px";
		div2.style.bottom 		= "110px";
		generalSum 				= generalSum + 110;
		generalButSum2			= generalButSum2 + 55;
		div2.style.height 		= "calc(100% - "+generalSum+"px)";
		button2.style.top		= "calc(50% - "+generalButSum2+"px)";
	}
	/*Hide menu*/
	else
	{
		div.style.display 		= "none";
		
		if (screenAR === "Landscape")
		{
			button.style.top		= "calc(100% - 102px)";
		}
		else
		{
			button.style.top		= "calc(100% - 55px)";	
		}
		
		button.style.transform 	= "rotate(180deg)";
		
		br.style.bottom			= "10px";
		br2.style.bottom		= "10px";
		bl.style.bottom			= "10px";
		div2.style.bottom 		= "0%";
		div2.style.height 		= "calc(100% - "+generalSum+"px)";
		button2.style.top		= "calc(50% - "+generalButSum2+"px)";
	}
	
	showMenu 				= !showMenu;
}

/*Show or hide the left general information*/
function ShowHideGeneral() 
{
	var div 				= document.getElementById("generalDiv");
	var button				= document.getElementById("generalButton");
	var button2				= document.getElementById("menuButton");
	var tl					= document.getElementById("block_tl");
	var bl					= document.getElementById("block_bl");
	
	/*Show general*/
	if (!showGeneral)
	{
		div.style.display 		= "block";
		
		if (screenAR === "Landscape")
		{
			button.style.right		= "calc(100% - 461px)";	
		}
		else
		{
			button.style.right		= "calc(100% - 261px)";	
		}
		
		tl.style.left			= "calc(20% + 15px)";
		bl.style.left			= "calc(20% + 15px)";
		canvas.style.left		= "calc((20% + 5px)/2)";	
		button.style.transform 	= "rotate(90deg)";
		
		button2.style.left		= "calc(60%)";
	}
	/*Hide general*/
	else
	{
		div.style.display 		= "none";
		
		if (screenAR === "Landscape")
		{
			button.style.right		= "calc(100% - 77px)";	
		}
		else
		{
			button.style.right		= "calc(100% - 43px)";	
		}
		
		tl.style.left			= "10px";
		bl.style.left			= "10px";
		canvas.style.left		= "0%";	
		button.style.transform 	= "rotate(270deg)";
		
		button2.style.left		= "calc(50%)";
	}
	
	showGeneral 			= !showGeneral;
}

/*Toggle the mesh Select/Deselect button*/
function MeshSelectChange(CheckBox)
{
	meshSelect 												= CheckBox.checked;
	
	var infoSelect = document.getElementById("infoSelect-switch")
		
	if (meshSelect)
	{	
		/*If meshSelect is active when a mesh is touched on the touch screen it is select*/
		document.getElementById("meshSelect-text").innerHTML 	= "Select";
		
		if (infoSelect)
		{
			infoSelect.disabled = false;
		}
	}
	else
	{
		/*If meshSelect is not active when a mesh is touched on the touch screen it is deselect*/
		document.getElementById("meshSelect-text").innerHTML	= "Deselect";
		
		if (infoSelect)
		{
			infoSelect.checked 										= false;
			infoSelect.disabled 									= true;
			document.getElementById("infoSelect-text").innerHTML 	= "Auto Info Off";
		}
	}
}

/*Toggle the info Select/Deselect button*/
function InfoSelectChange(cb)
{
	infoSelect 	= cb.checked;
	
	/*Infoselect calls the info pop-up auto (when touched or clicked)*/
	if (infoSelect)
	{
		document.getElementById("infoSelect-text").innerHTML = "Auto Info";				
	}
	else
	{
		document.getElementById("infoSelect-text").innerHTML = "Auto Info Off";
	}
}

/*Update the sensor data from the plc/backend push*/
function PlcDataPush(Data)
{
	if (newSpec === "SBS")
	{
		SBS_Data(Data);
	}
	else if (newSpec === "ReefCutter")
	{
		ReefCutter_Data(Data);
	}
}

/*Update the sensor data from the plc/backend push*/
function PlcErrorsPush(Errors)
{
	if (newSpec === "SBS")
	{
		SBS_Errors(Errors);
	}
	else if (newSpec === "ReefCutter")
	{
		ReefCutter_Errors(Errors);
	}
}

/*Block TR button*/
function Block_TR()
{
	var block 				= document.getElementById('block_tr');
	var btn 				= document.getElementById('block_tr_menu-button');
	var block2				= document.getElementById('block_tr2');
	
	if (block.style.display === "none")
	{
		block.style.display 	= "block";
		btn.style.background 	= "#bada55";
		block2.style.right		= "calc(31vw + 30px)";			
	}
	else
	{
		block.style.display 	= "none";
		btn.style.background 	= "grey";
		block2.style.right		= "10px";
	}
}

/*Block TL button*/
function Block_TL()
{
	var block 				= document.getElementById('block_tl');
	var btn 				= document.getElementById('block_tl_menu-button');
	
	if (block.style.display === "none")
	{
		block.style.display 	= "block";
		btn.style.background 	= "#bada55";
	}
	else
	{
		block.style.display 	= "none";
		btn.style.background 	= "grey";
	}
}

/*Block BR button*/
function Block_BR()
{
	var block 				= document.getElementById('block_br');
	var btn 				= document.getElementById('block_br_menu-button');
	var block2				= document.getElementById('block_br2');
	
	if (block.style.display === "none")
	{
		block.style.display 	= "block";
		btn.style.background 	= "#bada55";
		block2.style.right		= "calc(31vw + 30px)";	
	}
	else
	{
		block.style.display 	= "none";
		btn.style.background 	= "grey";
		block2.style.right		= "10px";
	}
}

/*Block BL button*/
function Block_BL()
{
	var block 				= document.getElementById('block_bl');
	var btn 				= document.getElementById('block_bl_menu-button');
	
	if (block.style.display === "none")
	{
		block.style.display 	= "block";
		btn.style.background 	= "#bada55";
	}
	else
	{
		block.style.display 	= "none";
		btn.style.background 	= "grey";
	}
}

/*Auto AspectRatio*/
function Auto_AspectRatio()
{
	/*Scale the bottum and top div, with ther arrows*/
	if (canvas.height > canvas.width)
	{
		screenAR					= "Portrait";
	}
	else
	{
		screenAR					= "Landscape";
	}
	
	var buttonMenu				= document.getElementById("menuButton");
	var buttonGen				= document.getElementById("generalButton");
	
	if (screenAR === "Landscape")
	{
		buttonGen.style.right	= "calc(100% - 77px)";
		buttonMenu.style.top	= "calc(100% - 102px)";
		
		var block_tr2 			= document.getElementById("block_tr2");
		block_tr2.style.height	= "calc(17vw + 100px)";
		block_tr2.style.width	= "calc(13vh - 20px)";
	}
	else
	{
		buttonGen.style.right	= "calc(100% - 43px)";	
		buttonMenu.style.top	= "calc(100% - 55px)";	
	}
}

/*Select all parts on the model*/
function SelectAllModel()
{
	/*All the meshes on the screen are selected*/
	newModel.forEach(part =>
	{
		/*If all are not already selected*/
		if (!selectAll)
		{
			part.material.diffuseColor 	= new BABYLON.Color3.Green();
			part.material.albedoColor	= new BABYLON.Color3.Green();
		
			/*Add mesh to list of selected meshes*/
			selectedMeshesNames.push(part.id);
			
			var posArr 					= [];
			posArr.push(part.position.x);
			posArr.push(part.position.y);
			posArr.push(part.position.z);
			selectedMeshesPos.push(posArr);
			
			var rotArr 					= [];
			rotArr.push(part.rotation.x);
			rotArr.push(part.rotation.y);
			rotArr.push(part.rotation.z);
			selectedMeshesRot.push(rotArr);
			
			var sclArr 					= [];
			sclArr.push(part.scaling.x);
			sclArr.push(part.scaling.y);
			sclArr.push(part.scaling.z);
			selectedMeshesScl.push(sclArr);		
		}
		else
		{
			var iMesh 					= selectedMeshesNames.indexOf(part.id)
	
			/*Deselect all*/
			if (iMesh !== -1)
			{
				part.material.diffuseColor	= new BABYLON.Color3.FromHexString("#3D4547");
				part.material.albedoColor 	= new BABYLON.Color3.FromHexString("#3D4547");
				
				deselectedMeshesNames.push(selectedMeshesNames[iMesh]);
				selectedMeshesNames.splice(iMesh,1);
				selectedMeshesPos.splice(iMesh,1);
				selectedMeshesRot.splice(iMesh,1);
				selectedMeshesScl.splice(iMesh,1);
				
				ClearDeselectedMeshes();
			}
		}
	})
	
	selectAll 					= !selectAll;
}

/*Extra button*/
function Extra_Button()
{
	/*This button may be added used for special needs such as the reefcutter - reef/path*/
	var btn 				= document.getElementById('extra-button');
	
	if (newSpec === "ReefCutter")
	{
		ReefCutter_ToggleView();
	}
	else if (newSpec === "SBS")
	{
		SBS_ToggleView();
	}
	else
	{
		if ((btn.style.background === "grey") || (btn.style.background === ""))
		{
			btn.style.background	= "#bada55";
		}
		else
		{
			btn.style.background 	= "grey";
		}
	}
}

/*Extra button*/
function Extra2_Button()
{
	/*This button may be added used for special needs such as the reefcutter - reef/path*/
	var btn 				= document.getElementById('extra2-button');
	
	if (newSpec === "ReefCutter")
	{
		ReefCutter_Replay();
	}
	else if (newSpec === "SBS")
	{
		SBS_Replay();
	}
	else
	{
		if ((btn.style.background === "grey") || (btn.style.background === ""))
		{
			btn.style.background	= "#bada55";
		}
		else
		{
			btn.style.background 	= "grey";
		}
	}
}

/*Dummy press*/
function Dummy_Press()
{
	if (newSpec === "ReefCutter")
	{
		ReplayDataRequest();
	}
	else if (newSpec === "SBS")
	{
		SBS_FastForward(true);
	}
}

/*Request data to be replayed*/
function ReplayDataRequest(Data)
{
	if (newSpec === "ReefCutter")
	{
		Socket.write(
		{
			"type": "Replay Data Request",
			"spec":	"ReefCutter",
			"data":	Data
		});
	}
}

/*Replay data*/
function ReplayDataResponse(Data)
{
	const rows 							= Data.split('\n');
		
	var cells							= [];
	 
	if (rows[0].indexOf(';') != -1)
	{
		rows.forEach(row =>
		{
			var tempRow 						= row.split(';');
			
			for (let i = 0; i < tempRow.length - 1; i++)
			{
				tempRow[i]							= tempRow[i].replace(",",".");
				tempRow[i]							= tempRow[i].replace("'",":");
			}
			
			tempRow[1]							= tempRow[1]+"0";
		
			cells.push(tempRow);
		});
	}
	else
	{
		rows.forEach(row =>
		{
			var tempRow 						= row.split(',');
			
			for (let i = 0; i < tempRow.length - 1; i++)
			{
				tempRow[i]							= tempRow[i].replace("'",":");
			}
			
			tempRow[1]							= tempRow[1]+"0";
		
			cells.push(tempRow);
		});
	}
	
	// Function to convert date and time to milliseconds
	function dateTimeToMilliseconds(date, time) 
	{
		return new Date(`${date} ${time}`).getTime();
	}

	// Calculate time differences in milliseconds
	let timeDifferencesInMilliseconds 	= [];
	
	for (let i = 1; i < cells.length - 2; i++) 
	{
		let currentDate 					= cells[i][0];
		let currentTime 					= cells[i][1];
		
		let nextDate 						= cells[i + 1][0];
		let nextTime 						= cells[i + 1][1];

		let currentTimeInMilliseconds 		= dateTimeToMilliseconds(currentDate, currentTime);
		let nextTimeInMilliseconds 			= dateTimeToMilliseconds(nextDate, nextTime);

		let differenceInMilliseconds 		= nextTimeInMilliseconds - currentTimeInMilliseconds;
		
		if (i > 1)
		{
			timeDifferencesInMilliseconds.push(timeDifferencesInMilliseconds[i - 2] + differenceInMilliseconds);
		}
		else
		{
			timeDifferencesInMilliseconds.push(differenceInMilliseconds);
		}
	}
	
	cells.pop();
	
	RCReplayDeltas						= timeDifferencesInMilliseconds;
	
	cells.forEach(row =>
	{
		var timeCorrect 					= row[1].substring(0, row[1].length - 4)+"'"+row[1].substring(row[1].length - 3, row[1].length - 1);
		
		row[1]								= timeCorrect;
	});
		
	RCReplayDataNow						= cells[1];
	RCReplayDataAll						= cells;
	RCReplayDeltas.unshift(0);
	RCReplayElapsed						= 0;
	RCReplayIndex						= 0;
	
	/*Setup ranger*/
	rangeOne 							= document.getElementById("rangeOne");
	rangeTwo 							= document.getElementById("rangeTwo");
	rangeCurrent 						= document.getElementById("rangeCurrent");
	outputOne 							= document.getElementById("outputOne");
	outputTwo 							= document.getElementById("outputTwo");
	outputMin 							= document.getElementById("outputMin");
	outputMax 							= document.getElementById("outputMax");
	outputCurrent						= document.getElementById("outputCurrent");
	inclRange 							= document.getElementById("incl-range");
					
	outputMin.innerHTML					= RCReplayDataAll[1][1];
	outputMax.innerHTML					= RCReplayDataAll[RCReplayDataAll.length - 1][1];
	
	minDelta							= 0;
	maxDelta							= RCReplayDeltas[RCReplayDeltas.length - 1];
		
	updateReplayRange(rangeOne);
	updateReplayRange(rangeTwo);
}

/*Request list to be replayed*/
function ReplayListRequest()
{
	if (newSpec === "ReefCutter")
	{
		Socket.write(
		{
			"type": "Replay List Request",
			"spec":	"ReefCutter",
			"data":	""
		});
	}
}

/*Replay list*/
function ReplayListResponse(Data)
{
    const replayOptions 	= Data.split('\n');
	
	/*Get the dropdown element*/
    const dropdown 			= document.getElementById('dropdown');

    /*Populate the dropdown with options from the array*/
    replayOptions.forEach(optionText => 
	{
		const option 			= document.createElement('option');
		option.text 			= optionText;
		dropdown.add(option);
    });
	
	ReplaySelect();
}

/*Choose a replay option*/
function ReplaySelect()
{
	const selectedOption	= dropdown.options[dropdown.selectedIndex].value;
	
	ReplayDataRequest(selectedOption);
}

/*Toggle the Data/Error Tags button*/
function DataErrorSelectChange(CheckBox)
{
	dataErrorSelect 									= CheckBox.checked;
	
	if (newSpec === "ReefCutter")
	{
		ReefCutter_Table();
	}
	else
	{
		SBS_Table();
	}
}

/*Update replay range*/
function updateReplayRange(ranger) 
{
	var vals						= [rangeOne.value,rangeTwo.value];
	var minVal						= Math.min(...vals);
	var maxVal						= Math.max(...vals);
		
	inclRange.style.width 			= (maxVal - minVal)/100*100+'%';
	inclRange.style.left 			= minVal/100*100+'%';
	
	var checkMin					= minVal/100*RCReplayDeltas[RCReplayDeltas.length - 1];
	var nearestValues 				= findNearestValues(RCReplayDeltas, checkMin);
	minDelta						= nearestValues.smaller;
	
	var checkMax					= maxVal/100*RCReplayDeltas[RCReplayDeltas.length - 1];
	nearestValues 					= findNearestValues(RCReplayDeltas, checkMax);
	maxDelta						= nearestValues.larger;
	
	if (rangeOne.value < rangeTwo.value)
	{
		outputOne.innerHTML				= addMillisecondsToTime(RCReplayDataAll[1][1],minDelta);
		outputTwo.innerHTML				= addMillisecondsToTime(RCReplayDataAll[1][1],maxDelta);
		outputOne.style.left			= minDelta/RCReplayDeltas[RCReplayDeltas.length - 1]*100+"%";
		outputTwo.style.left			= maxDelta/RCReplayDeltas[RCReplayDeltas.length - 1]*100+"%";
	}
	else
	{
		outputOne.innerHTML				= addMillisecondsToTime(RCReplayDataAll[1][1],maxDelta);
		outputTwo.innerHTML				= addMillisecondsToTime(RCReplayDataAll[1][1],minDelta);
		outputOne.style.left			= maxDelta/RCReplayDeltas[RCReplayDeltas.length - 1]*100+"%";
		outputTwo.style.left			= minDelta/RCReplayDeltas[RCReplayDeltas.length - 1]*100+"%";
	}
	
	outputCurrent.innerHTML			= addMillisecondsToTime(RCReplayDataAll[1][1],minDelta);
	rangeCurrent.style.left			= minDelta/RCReplayDeltas[RCReplayDeltas.length - 1]*100+"%";
	
	if (RCReplayElapsed > maxDelta)
	{
		RCReplayElapsed 				= maxDelta;
	}
	else if (RCReplayElapsed < minDelta)
	{
		RCReplayElapsed 				= minDelta;
	}
	
	const rect1 					= outputOne.getBoundingClientRect();
	const rect2 					= outputTwo.getBoundingClientRect();

	if (rect1.right > rect2.left && rect1.left < rect2.right) 
	{
		outputOne.style.bottom 			= "55%";
		outputTwo.style.bottom 			= "95%";
	}
	else
	{
		outputOne.style.bottom 			= "75%";
		outputTwo.style.bottom 			= "75%";
	}
};

/*Buttons for replay*/
function Replay_Buttons(Button) 
{
	var btnPressed				= document.getElementById(Button.id);
	var btnPlay					= document.getElementById('play-button');
	var btnSlower				= document.getElementById('slower-button');
	var btnSlowest				= document.getElementById('slowest-button');
	var btnFaster				= document.getElementById('faster-button');
	var btnFastest				= document.getElementById('fastest-button');
	var btnPause				= document.getElementById('pause-button');
	
	if (btnPressed.style.background === "grey")
	{
		btnPressed.style.background = "#bada55";
	}
	else
	{
		btnPressed.style.background = "grey";
	}
	
	if (btnPlay.id !== btnPressed.id)
	{
		btnPlay.style.background 	= "grey";
	}
	
	if (btnSlower.id !== btnPressed.id)
	{
		btnSlower.style.background 	= "grey";
	}
	
	if (btnSlowest.id !== btnPressed.id)
	{
		btnSlowest.style.background = "grey";
	}
	
	if (btnFaster.id !== btnPressed.id)
	{
		btnFaster.style.background 	= "grey";
	}
	
	if (btnFastest.id !== btnPressed.id)
	{
		btnFastest.style.background = "grey";
	}
	
	if (btnPause.id !== btnPressed.id)
	{
		btnPause.style.background 	= "grey";
	}
	
	rangeCurrent.style.display	= "block";
	outputCurrent.style.display	= "block";
	
	var skip					= false;
	
	switch (Button.id)
	{
		case btnSlowest.id:	if (replayState !== 1)
							{
								replayState 	= 1;
								replaySpeed 	= 5;
								replaying		= true;
								replayForward	= false;
								skip			= true;
							}
							break;	
		case btnSlower.id:	if (replayState !== 2)
							{
								replayState 	= 2;
								replaySpeed 	= 2;
								replaying		= true;
								replayForward	= false;
								skip			= true;
							}								
							break;	
		case btnPlay.id:	if (replayState !== 3)
							{
								replayState 	= 3;
								replaySpeed 	= 1;
								replaying		= true;
								replayForward	= true;
								skip			= true;
							}									
							break;	
		case btnFaster.id:	if (replayState !== 4)
							{
								replayState 	= 4;
								replaySpeed 	= 2;
								replaying		= true;
								replayForward	= true;
								skip			= true;
							}							
							break;	
		case btnFastest.id:	if (replayState !== 5)
							{
								replayState 	= 5;
								replaySpeed 	= 5;
								replaying		= true;
								replayForward	= true;
								skip			= true;
							}							
							break;
		case btnPause.id:	if (replayState !== 6)
							{
								replayState 	= 6;
								replaySpeed 	= 0;
								replaying		= true;
								replayForward	= true;
								skip			= true;
							}							
							break;
	}
	
	if (!skip)
	{
		replayState 	= 0;
		replaySpeed 	= 1;
		replaying		= false;
	}
};

/*Find nearest delta time values*/
function findNearestValues(arr, value) 
{
    arr.sort((a, b) => a - b);

    let smaller 	= null;
    let larger 		= null;

    for (let i = 0; i < arr.length; i++)
	{
        if (arr[i] === value) 
		{
            return { smaller: value, larger: value };
        } 
		else if (arr[i] < value) 
		{
            smaller 		= arr[i];
        } 
		else 
		{
            larger 			= arr[i];
			break;
        }
    }

    return {smaller, larger};
}

/*Convert start and elapsed to timestamp*/
function addMillisecondsToTime(time, delta) 
{
    const [hour, minute, secondmillisecond] 	= time.split(':');
	const second								= secondmillisecond.toString().substring(0,2);
	const millisecond							= secondmillisecond.toString().substring(3,5)*10;
	
    const totalMilliseconds 					=
        hour * 60 * 60 * 1000 +
        minute * 60 * 1000 +
        second * 1000 +
        millisecond +
        delta;
	
    const newHour 								= Math.floor(totalMilliseconds / (60 * 60 * 1000)) % 24;
    const newMinute 							= Math.floor(totalMilliseconds / (60 * 1000)) % 60;
    const newSecond 							= Math.floor(totalMilliseconds / 1000) % 60;
    const newMillisecond 						= totalMilliseconds % 1000;

    const newTime = `${newHour.toString().padStart(2, '0')}:${newMinute
        .toString()
        .padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}'${newMillisecond.toString().substring(0,2).padStart(2, '0')}`;

    return newTime;
}