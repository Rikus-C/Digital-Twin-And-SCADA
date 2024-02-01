const UpdateValuesFromBuffer = () =>
{
    /*if dataBuffer is not empty*/
    if (dataBuffer.length < 1) return;

    for (var i = 0; i < currentView.elements.length; i++)
    {
        /*if an analog value is being looked at*/
        if (currentView.elements[i].type === "value")
        {
            try
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                dataBuffer[dataBuffer.length - 1][currentView.elements[i].id.replace("Value ", "")].value;
            }

            catch 
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                "<b><i>Invalid ID</b></i>";
            }
        }

        /*if a digital value is being looked at*/
        else if (currentView.elements[i].type === "digital")
        {
            try
            {
                let light;
                
                /**/
                if (dataBuffer[dataBuffer.length - 1][currentView.elements[i].id.replace("Digital ", "")].value === 0)
                    light = "<div class='grey-digital'></div>";

                /**/
                else
                    light = "<div class='blue-digital'></div>";

                document.getElementById(currentView.elements[i].id).innerHTML = light;
            }

            catch 
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                "<div class='grey-digital'></div>";
            }
        }

        /*if no vlaue is being looked at*/
        else continue;
    }
}

const UpdateValuesFromPLC = (data) =>
{
    for (var i = 0; i < currentView.elements.length; i++)
    {
        /*if a value element is not being looked at*/
        if (currentView.elements[i].type === "value")
        {
            try
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                data[currentView.elements[i].id.replace("Value ", "")].value;
            }

            catch 
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                "<b><i>Invalid ID</b></i>";
            }
        }

        /*if an digital value is being looked at*/
        else if (currentView.elements[i].type === "digital")
        {
            try
            {
                let light;

                /**/
                if (data[currentView.elements[i].id.replace("Digital ", "")].value === 0)
                    light = "<div class='grey-digital'></div>";

                /**/
                else
                    light = "<div class='blue-digital'></div>";

                document.getElementById(currentView.elements[i].id).innerHTML = light;
            }

            catch 
            {
                document.getElementById(currentView.elements[i].id).innerHTML =
                "<div class='grey-digital'></div>";
            }
        }

        /*if no vlaue is being looked at*/
        else continue;
    }
}

const UpdateWarningsFromBuffer = () =>
{
    /*if dataBuffer is not empty*/
    if (warningBuffer.length < 1) return;

    for (var i = 0; i < currentView.elements.length; i++)
    {
        /*if a value element is not being looked at*/
        if (currentView.elements[i].type !== "warning") continue;

        try
        {
            let light;
            
            /**/
            if (warningBuffer[warningBuffer.length - 1][currentView.elements[i].id].value === 0)
                light = "<div class='green-warning'></div>";

            /**/
            else
                light = "<div class='red-warning'></div>";

            document.getElementById(currentView.elements[i].id).innerHTML = light;
        }

        catch 
        {
            document.getElementById(currentView.elements[i].id).innerHTML =
            "<div class='grey-warning'></div>";
        }
    }
}

const UpdateWarningsFromPLC = (warnings) =>
{
    for (var i = 0; i < currentView.elements.length; i++)
    {
        /*if a value element is not being looked at*/
        if (currentView.elements[i].type !== "warning") continue;

        try
        {
            let light;

            /**/
            if (warnings[currentView.elements[i].id].value === 0)
                light = "<div class='green-warning'></div>";

            /**/
            else
                light = "<div class='red-warning'></div>";

            document.getElementById(currentView.elements[i].id).innerHTML = light;
        }

        catch 
        {
            document.getElementById(currentView.elements[i].id).innerHTML =
            "<div class='grey-warning'></div>";
        }
    }
}
