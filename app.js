const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require('express');

//import custom modules
const p = require('./js/Player.js');

const app = express();

//tcp port
const tcp_port = 5006;
//udp port
const udp_port = 41234;

//setup tcp server
const tcpserver = require('http').Server(app);
tcpserver.listen(tcp_port, () => console.log(`App listening tcp at localhost:${tcp_port}`))
var io = require('socket.io')(tcpserver,{});

//------------------------------------------------------------------------------------------------------------------------------------

//existing connections
var PLAYER_LIST = {};

//receiving udp messages
server.on('message', (msg, rinfo) => {
  console.log(`${msg} from ${rinfo.address}:${rinfo.port}`);
  server.send(Buffer.from('Some bytes'), 5005, 'localhost');
});

//receiving tcp messages
io.sockets.on('connection', function(socket){
	console.log("new player joined");
    socket.id = Math.random();
	console.log("id generated as " + socket.id);
	
	var player = new p.Player(socket.handshake.address, socket.id, socket);
    PLAYER_LIST[socket.id] = player;

	socket.on('keyPressed',function(data){
        player.updateKey(data[0], data[1])
    });

	socket.on('disconnect',function(){
		  delete PLAYER_LIST[socket.id];
		  console.log(socket.id + " left the game");
    });

    socket.on('info',function(data){
		  console.log(`${data} from ${player.ipaddress}`);
    });
});

//setup udp server
server.bind(udp_port);
console.log(`App listening udp at localhost:${udp_port}`)

var sendPositionPacket = function(){
    for(playerKey in PLAYER_LIST){
        PLAYER_LIST[playerKey].update();
    }
}

setInterval(function(){
    sendPositionPacket();
},1000/15);