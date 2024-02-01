/*Event listener for the wheel event*/
document.addEventListener("wheel", function (event) 
{
	if (!Operator && renderComplete)
	{
		if ((newPart.length > 0) || (newModel.length > 0))
		{
			/*The wheel event will move the selected meshes in and out of the screen (z-axis) or rotate (along the z-axis)*/
			if (cameraMoveEnable === false)
			{
				/*When shift is held it means a rotate event is happening*/
				if (event.shiftKey) 
				{
					/*Delta Y helps to check the direction of the wheel*/
					if (event.deltaY > 0) 
					{
						meshInRotate	= true;
						newMeshMove 	= true;
					} 
					else 
					{
						meshOutRotate	= true;
						newMeshMove 	= true;
					}
				}
				else
				{
					if (event.deltaY > 0) 
					{
						meshIn		= true;
						newMeshMove	= true;
					} 
					else 
					{
						meshOut		= true;
						newMeshMove	= true;
					}
				}
			}	
		}	
	}
});

/*Event listener for the keydown event*/
document.addEventListener("keydown", function (event)
{
	if (!Operator && renderComplete)
	{
		if (event.code === "KeyM") 
		{
			if (!defaultInit)
			{
				if (showTitle)
				{
					ShowHideTitle();
				}
				
				/*If a model is not loaded*/
				if (newModel.length === 0)
				{
					/*If there are no models to load, check if there are parts first*/
					if (listedModels.length === 0)
					{
						partModelCall 		= true;
						PartListRequest();
					}
					else
					{
						CallModelDropDown();
					}
				}
				else
				{
					Swal.fire('Model already loaded');
				}
			}
			else
			{
				Swal.fire("Can't load model when initialising default settings");
			}
		}
		else if (event.code === "KeyP") 
		{
			if (!defaultInit)
			{
				if (showTitle)
				{
					ShowHideTitle();
				}
					
				if (selectedMeshesNames.length === 0)
				{
					/*If there are no parts to load, check again*/
					if (listedParts.length === 0)
					{
						PartListRequest();
					}
					else
					{
						CallPartDropDown();
					}
				}
				else
				{
					Swal.fire("Can't load part when current parts selected");
				}
			}
			else
			{
				Swal.fire("Can't load part when initialising default settings");
			}
		}
		else if ((newPart.length > 0) || (newModel.length > 0))
		{
			if (event.code === "KeyC") 
			{
				if (cameraMoveEnable === true) 
				{
					cameraMoveEnable = false;
				}
				else
				{
					cameraMoveEnable = true;
				}
				newCameraMove	= true;
			}
			else if ((((event.code === "KeyZ") && (event.ctrlKey)) && ((meshScaleHeld === false) && (selectedMeshesNames.length > 0))) && (cameraMoveEnable === false))
			{
				CallScalingOptions();
			}
			else if ((((event.code === "KeyZ") && (!event.shiftKey)) && ((meshScaleHeld === false) && (selectedMeshesNames.length > 0))) && (!event.ctrlKey))
			{
				meshScaleUp 	= true;
				meshScaleHeld 	= true;
				newMeshMove		= true;
			}
			else if (event.code === "Space") 
			{
				if (event.shiftKey)
				{
					if (newModel.length > 0)
					{
						ReloadModel();
					}	
				}
				else if (event.ctrlKey)
				{
					if (newModel.length > 0)
					{
						ReloadModelFile();
					}	
				}
				else
				{
					if (cameraMoveEnable === true) 
					{
						cameraSnap		= true;
						newCameraMove	= true;
					}
					else if (selectedMeshesNames.length > 0)
					{
						meshSnap 	= true;
						newMeshMove	= true;
					}
				}
			}
			else if (event.code === "KeyF")
			{
				Dummy_Press();
			}
			else if ((event.code === "KeyK") && (selectedMeshesNames.length > 0))
			{
				ColorListRequest();
			}
			else if ((event.code === "KeyI") && (!event.ctrlKey))
			{
				if (newModel.length > 0)
				{
					LoadModelInfoRequest();
				}
				else
				{
					Swal.fire('No model selected');
				}
			}	
			else if ((event.code === "KeyA") && (event.ctrlKey))
			{
				SelectAllModel();	
			}	
			else if (event.code === "KeyR") 
			{
				ClearDeselectedMeshes();	
			}
			else if (event.code === "Delete") 
			{
				DeleteParts();
			}
			else if (event.code === "KeyU") 
			{
				if ((newModel.length > 0) || (newPart.length > 0))
				{
					UpdateModelRequest();
				}
			} 
			else if ((event.which > 48) && (event.which < 55))
			{
				ReefCutter_FrontBodyPosRot(event.which - 48,!event.shiftKey);
			}
			else if ((event.which === 189) || (event.which === 109))
			{
				if (moveSpeed > 0.1)
				{
					moveSpeed -= 0.1;
				}
			}
			else if ((event.which === 109) || (event.which === 107)) 
			{
				if (moveSpeed < 1)
				{
					moveSpeed += 0.1;
				}
			}
			else if (cameraMoveEnable === false) 
			{		
				if (event.shiftKey) 
				{
					switch(event.which) 
					{
						case 37:
							meshLeftRotate	= true;
							newMeshMove 	= true;
							break;
						case 38:
							meshUpRotate	= true;
							newMeshMove 	= true;
							break;
						case 39:
							meshRightRotate	= true;
							newMeshMove 	= true;
							break;
						case 40:
							meshDownRotate	= true;
							newMeshMove 	= true;
							break;
						case 100:
							meshLeftRotate	= true;
							newMeshMove 	= true;
							break;
						case 104:
							meshUpRotate	= true;
							newMeshMove 	= true;
							break;
						case 102:
							meshRightRotate	= true;
							newMeshMove 	= true;
							break;
						case 98:
							meshDownRotate	= true;
							newMeshMove 	= true;
						case 65:
							meshLeftRotate	= true;
							newMeshMove 	= true;
							break;
						case 83:
							meshUpRotate	= true;
							newMeshMove 	= true;
							break;
						case 68:
							meshRightRotate	= true;
							newMeshMove 	= true;
							break;
						case 87:
							meshDownRotate	= true;
							newMeshMove 	= true;
							break;
						case 90:
							if ((selectedMeshesNames.length > 0) && (meshScaleHeld === false))
							{
								meshScaleDown 	= true;
								meshScaleHeld 	= true;
								newMeshMove		= true;
							}
							break;
						default:
							break;
					}
				}
				else
				{
					if (((event.code === "ArrowUp") || (event.code === "Numpad8")) || (event.code === "KeyW"))
					{
						meshUp 			= true;
						newMeshMove 	= true;
					}
					else if (((event.code === "ArrowDown") || (event.code === "Numpad2")) || (event.code === "KeyS")) 
					{
						meshDown 		= true;
						newMeshMove 	= true;
					}
					else if (((event.code === "ArrowLeft") || (event.code === "Numpad4")) || (event.code === "KeyA"))
					{
						meshLeft 		= true;
						newMeshMove 	= true;
					}
					else if (((event.code === "ArrowRight") || (event.code === "Numpad6")) || (event.code === "KeyD")) 
					{
						meshRight 		= true;
						newMeshMove 	= true;
					}
				}	
			}	
		}	
	}
	
});

/*Event listener for the keyup event*/
document.addEventListener("keyup", function (event)
{
	if (!Operator && renderComplete)
	{	
		if ((newPart.length > 0) || (newModel.length > 0))
		{
			if (event.code === "KeyZ") 
			{
				if (selectedMeshesNames.length > 0)
				{
					meshScaleHeld 	= false;
				}
			}	
		}
	}
});

