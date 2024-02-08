// const fs            	= require("fs");
var activeView = document.getElementById("main_display");

const ViewClicked = (element) => 
{
  /**/
  if (followMouse)
  {
    StickToMouse(element);
    return;
  }

  var validClick = false;

  /*if an element that is of type image is clicked*/
  if (element.target.nodeName === 'IMG') validClick = true;

  /*if an element that is of type div/value is clicked*/
  if (element.target.nodeName === 'DIV') validClick = true;

  /*if an element that is of type div/value is clicked*/
  if (element.target.nodeName === 'P') validClick = true;

  /*if the background is clicked*/
  if (element.target.id === 'main_display') validClick = false;

  /*if a non valid element was clicked*/
  if (!validClick) return;
  
  SelectElementInView(element.target.id);
}

activeView.addEventListener("click", ViewClicked);

document.addEventListener('keyup', async (event) => 
{
	if (!reefName)
	{
		/*if user wants to add a new element to view*/
		if (event.key === "a") AddNewElementToPage();

		/*if user wants to save the current view*/
		else if (event.key === "s") SaveCurrentView();   

		/*is user wants to delete element from current view*/
		else if (event.key === "d") DeleteElementFromView();

		/*if user wants to edit an element in the current view*/
		else if (event.key === "e") EditModeSelect();

		/*if a key is pressed that changes properties of selected elements*/
		else EditElementsProperties(event.key);
	}
});
