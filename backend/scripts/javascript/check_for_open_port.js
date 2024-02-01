var fs = require('fs');
var net = require('net');

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
            fs.writeFile("./backend/settings/com_ports_setup.json", JSON.stringify(port_tester.set), () => {});
        }});
    server.listen(initial_port, '127.0.0.1');    
}

port_tester.update_valid_ports = function(initial_port){
    port_tester.set = require('../../settings/com_ports_setup.json');
    port_tester.valid_ports = [];
    port_tester.ports_required = Object.keys(port_tester.set).length;
    port_tester.look_for_ports(initial_port);
}

module.exports = port_tester;