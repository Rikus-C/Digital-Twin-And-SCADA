var fs = require('fs');
var net = require('net');

// CREATE DUMMY SERVERS TO OCUPY SOME PORTS

const serverA = net.createServer();
serverA.on('listening', () => {});
serverA.listen(12345, '127.0.0.1'); 

const serverB = net.createServer();
serverB.on('listening', () => {});
serverB.listen(12346, '127.0.0.1'); 

const serverC = net.createServer();
serverC.on('listening', () => {});
serverC.listen(12347, '127.0.0.1'); 

const serverD = net.createServer();
serverD.on('listening', () => {});
serverD.listen(12349, '127.0.0.1');

var port_tester = {};

port_tester.look_for_ports = function(initial_port){
    const server = net.createServer();

    server.once('error', function(){
        initial_port += 1;
        server.close();
        port_tester.look_for_ports(initial_port);
    });
    
    server.once('listening', function(){ // valid port was found
        port_tester.valid_ports.push(initial_port);

        if(port_tester.valid_ports.length != port_tester.ports_required){
            initial_port += 1;
            server.close();
            port_tester.look_for_ports(initial_port);
        }else{
            server.close();
            Object.keys(port_tester.set).forEach(function(key, index){
                port_tester.set[key] = port_tester.valid_ports[index];
            });
            fs.writeFile('../settings/reef_detector_port.json', JSON.stringify(port_tester.set), () => {});
        }
    });
    server.listen(initial_port, '127.0.0.1');    
}

port_tester.update_valid_ports = function(initial_port){
    port_tester.set = require('../settings/reef_detector_port.json');
    port_tester.valid_ports = [];
    port_tester.ports_required = Object.keys(port_tester.set).length;
    port_tester.look_for_ports(initial_port);
}

port_tester.update_valid_ports(12345);

setTimeout(()=>{ // do not ibclude this part in the final one
    serverA.close();
    serverB.close();
    serverC.close();
    serverD.close();
}, 1000);

module.exports = port_tester;