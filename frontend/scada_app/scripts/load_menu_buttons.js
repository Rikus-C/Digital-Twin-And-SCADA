// Create menu button layout from settings file found in backend settings folder, get names
// of each button based on the names of the layout files in the layout folder found in backend settinsg


// Do all of this in a function that can be called after a change in menu buttons was made to reload it 


// Also add a function for deleting the menu buttons
// Finally add one more function for renamimg buttons


// Rather use a button order file that gets updated on change of button layout 

document.getElementById("B-01").addEventListener("click", () => {LoadNewView("overview");});
document.getElementById("B-02").addEventListener("click", () => {LoadNewView("variables");});
document.getElementById("B-03").addEventListener("click", () => {LoadNewView("plots");});

