var currentMenuNames = []
// var currentMenuOrder = []
var appStart = true;

function removeElementFromArray(array, elementToRemove) {
    // Use the filter method to create a new array without the specified element
    const newArray = array.filter(item => item !== elementToRemove);
    return newArray;
}

function GenerateMenuButtons(menuNames, menuOrder) { 
    // Makes sure the settings file match
    if ((menuNames.length !== menuOrder.length) || (menuNames.length === 0)) {
        // Change menu order list to file list
        menuOrder = menuNames;
        // Save the new menu order list to backend
        webSocket.Send({type: "Update Menu Order List", data: menuOrder});
        
    } 
    
    else {  
        for (var x = 0; x < menuNames.length; x++) {
            if (!menuNames[x].indexOf(menuOrder)) {
                menuOrder = menuNames;
                // Save the new menu order list to backend
                webSocket.Send({type: "Update Menu Order List", data: menuOrder});
                break;
            }
        }
    }

    currentMenuNames = menuNames;
    // currentMenuOrder = menuOrder

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

function UpdateMenu(key) {
    /*if program is not currently in edit mode*/
    if (!editMode) return;

    /*if a sweet alert windows is allready open*/
    if (swalBusy) return;

    /*if follow mouse mode is active*/
    if (followMouse) return;

    swalBusy = true;

    if (key === "f") {
        var newName;
        Swal.fire({
            title: "Name of New Page",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Add",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: async (someName) => {newName = someName}
        }).then((result) => {
            swalBusy = false;

            if (result.isConfirmed) {
                webSocket.Send({type: "Add New Menu Button", data: newName});
            }
        });
    }

    else if (key === "g") {
        var toDelete;
        Swal.fire({
            title: "Name of New Page to Delete",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Delete",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: async (someName) => {toDelete = someName}
        }).then((result) => {
            // Ensure page does exists
            swalBusy = false; 

            if (result.isConfirmed) {
                if (!toDelete.indexOf(currentMenuNames)) return;
                webSocket.Send({type: "Delete Menu Button", data: toDelete});
            }
        });
    }

    else if (key === "v") {
        var toMove; 
        var position;
        Swal.fire({
            title: "Name of Page Button to Move",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Select",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: async (someName) => {toMove = someName}
        }).then((result) => {
            swalBusy = false;
            // Ensure page does exists 
            if (!toMove.indexOf(currentMenuNames)) return;

            if (result.isConfirmed) {
                swalBusy = true;
                Swal.fire({
                    title: "New Posistion?",
                    input: "number",
                    inputAttributes: {
                        autocapitalize: "off"
                    },
                    showCancelButton: true,
                    confirmButtonText: "Move",
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false,
                    preConfirm: async (newPosition) => {position = newPosition}
                }).then((innerResult) => {
                    swalBusy = false;
                    if (innerResult.isConfirmed) {
                        if (position > currentMenuNames.length) position = currentMenuNames.length;
                        if (position <= 0) position = 1;

                        var list = removeElementFromArray(currentMenuNames, toMove);
                        var  newList = [
                            ...list.slice(0, position-1),
                            toMove,
                            ...list.slice(position-1)
                        ];
                        webSocket.Send({type: "Update Menu Order List", data: newList});
                    }
                });
            }
        });
    } 
}

setTimeout(()=>{webSocket.Send({type: "Get Menu Settings"});}, 2000);


