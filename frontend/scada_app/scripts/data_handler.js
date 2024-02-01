var dataBuffer      = [];
var warningBuffer   = [];
var bufferLimit     = 60;

const AppendToDataBuffer = (data) =>
{
    /*if dataBuffer is full ands needs to be shifted*/
    if (dataBuffer.length === bufferLimit)
    {
        dataBuffer.shift();
        dataBuffer.push(data);
        return;
    }

    /*if dataBuffer is not yet full*/
    if (dataBuffer.length < bufferLimit)
    {
        dataBuffer.push(data);
        return;
    }

    /*if dataBuffer has overflown*/
    if (dataBuffer.length > bufferLimit)
    {
        for (var i = dataBuffer.length; i >= 99; i--)
            dataBuffer.shift();  

        dataBuffer.push(data);
        return;
    }
}

const AppendToWarningBuffer = (warnings) =>
{
    /*if warningBuffer is full ands needs to be shifted*/
    if (warningBuffer.length === bufferLimit)
    {
        warningBuffer.shift();
        warningBuffer.push(warnings);
        return;
    }

    /*if warningBuffer is not yet full*/
    if (warningBuffer.length < bufferLimit)
    {
        warningBuffer.push(warnings);
        return;
    }

    /*if warningBuffer has overflown*/
    if (warningBuffer.length > bufferLimit)
    {
        for (var i = warningBuffer.length; i >= 99; i--)
            warningBuffer.shift();  

        warningBuffer.push(warnings);
        return;
    }
}