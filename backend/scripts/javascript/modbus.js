modbus = {};

/*combines two or more bytes, bytes must be in hex format*/
var CombineBytes = (bytes) =>
{
    var combined = "";
    
    /*for each byte that needs to be merged*/
    bytes.forEach((currentByte) =>
    {
        var cB = currentByte.toString(16);

        /*if a 0 needs to be added to the front of the byte value (hex)*/
        if (cB.length === 1)
        {
            cB = "0" + cB;
        }
        combined += cB;
    });

    return parseInt(combined, 16);
}

/*convert message object to a modbus frame that can be read by PLC*/
modbus.Convert = (msgFrame) =>
{
    var arrayTemp = [];

    Object.keys(msgFrame).forEach((member) => 
    {
        /*if formatting is correct*/
        if (typeof msgFrame[member] === "object")
        {
            var currentMember = msgFrame[member];
            
            /*if current value is only one byte long*/
            if (currentMember.bytes === 1)
            {
                arrayTemp.push(currentMember.value);
            }
            /*if current value is more than one byte long*/
            else 
            {
                /*current values's in bit array form*/
                var bitArray = String(currentMember.value.toString(2));

                /*number of bytes bytes that the value concists of*/
                var byteCount = currentMember.bytes;

                /*remaining amount of bytes of the current value*/
                var byteAmnt = Math.ceil(bitArray.length/8);
                
                /*for the amount of bytes used by the currrent value*/
                for (var b = 0; b < currentMember.bytes; b++)
                {
                    var currentByte = [];

                    /*if current value's amount of bytes is less than value's original byte count*/
                    if (byteAmnt < byteCount)
                    {
                        arrayTemp.push(0);
                        byteCount -= 1;
                    }
                    else
                    {
                        /*isolate bits that form part of different bytes from each other*/
                        do
                        {
                            currentByte.push(bitArray[0]);
                            bitArray = bitArray.substring(1);
                        }
                        /*while bits are part of the same byte*/
                        while (bitArray.length % 8 !== 0);

                        arrayTemp.push(parseInt(currentByte.join(""), 2));
                        byteCount -= 1;
                    }
                }
            } 
        }
    });
    
    var msgFrame = Buffer.alloc(arrayTemp.length);

    /*assemble final byte buffer to be sent via modbus*/
    arrayTemp.forEach((byteVal, byteIndx) =>
    {
        msgFrame.writeUInt8(byteVal, byteIndx);
    });

    return msgFrame;
}

/*convert raw bit-data from PLC to object readable by the program*/
modbus.Read = (rawFrame) =>
{
    /*if frame has data in it*/
    if (rawFrame.length > 9)
    {
        var transactionID = CombineBytes([rawFrame[0], rawFrame[1]]);

        /*if some data receievd might not be in WORD fromat*/
        if (rawFrame[8] % 2 !== 0)
        {
            console.log("Error: Not all data received are WORDS, message is ignored");
            console.log("Transaction ID of ignored message:" + transactioID.toString());

            return "error";
        }
        /*if all data is in WORD format*/
        else
        {
            var msg = [];

            /*combine bytes into their respective words and save values in array*/
            for (var position = 9; position < 9 + rawFrame[8]; position += 2)
            {
                msg.push(CombineBytes([rawFrame[position], rawFrame[position + 1]]));
            }

            return [msg, transactionID];
        }
    }
    /*if the frame is an error frame/message*/
    else
    {
        console.log("Error frame received:");
        console.log(rawFrame + "\n\n");

        return "error";
    }
}

module.exports = modbus;



