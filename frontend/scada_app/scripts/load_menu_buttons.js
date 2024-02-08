var currentMenuNames = []
var currentMenuOrder = []
var appStart = true;

function GenerateMenuButtons(menuNames, menuOrder) { 
    // Makes sure the settings file match
    if (menuNames.length !== menuOrder.length) {}

    currentMenuNames = menuNames;
    currentMenuOrder = menuOrder

    // Create HTML snippet for the menu buttons
    var HTML = "";
    menuOrder.forEach((name) => {
        HTML += "<div id='" + name + "-menu' class='block_menu'>";
        HTML += "<button id='" + name + "' class='block_menu-button' type='button'></button>";
        HTML += "<div id='" + name + "-text' class='block_menu-child'>";
        HTML += name;
        HTML += "</div></div>"
    });

    // Inject the HTML into main page
    document.getElementById("button-menu").innerHTML = HTML;
    


    menuOrder.forEach((name) => {
        document.getElementById(name).addEventListener("click", () => {LoadNewView(name);});
    });

    if (!appStart) return;
    LoadNewView(menuOrder[0]);
    appStart = false;
    
}

// Do all of this in a function that can be called after a change in menu buttons was made to reload it 


// Also add a function for deleting the menu buttons
// Finally add one more function for renamimg buttons


// Rather use a button order file that gets updated on change of button layout 

// document.getElementById("B-01").addEventListener("click", () => {LoadNewView("overview");});

// document.getElementById("B-02").addEventListener("click", () => {LoadNewView("variables");});
// document.getElementById("B-03").addEventListener("click", () => {LoadNewView("plots");});

webSocket.Send({type: "Get Menu Settings"});

