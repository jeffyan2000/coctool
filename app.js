const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require('express');

//import custom modules
const p = require('./js/Player.js');

const app = express();

//tcp port
const tcp_port = 6001;
//udp port
const udp_port = 6002;

//setup tcp server
const tcpserver = require('http').Server(app);
tcpserver.listen(tcp_port, '0.0.0.0', () => console.log(`App listening tcp at localhost:${tcp_port}`))
var io = require('socket.io')(tcpserver,{});

//------------------------------------------------------------------------------------------------------------------------------------

//existing connections
var PLAYER_LIST = {};

//receiving udp messages
server.on('message', (msg, rinfo) => {
  console.log(`${msg} from ${rinfo.address}:${rinfo.port}`);
  server.send(msg, 0, msg.length, rinfo.port, rinfo.address );
});

//receiving tcp messages
io.sockets.on('connection', function(socket){
	console.log("new player joined");
    socket.id = Math.random();
	console.log("id generated as " + socket.id);
    //get ip of client
    ipvaddress = socket.handshake.address;
    if (ipvaddress.substr(0, 7) == "::ffff:") {
        ipvaddress = ipvaddress.substr(7);
    }

	var player = new p.Player(ipvaddress, socket.id, socket);
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

    socket.on('port',function(data){
        player.port = data;
        console.log(data);
  });
});

//setup udp server
server.bind(udp_port);
console.log(`App listening udp at localhost:${udp_port}`)

var sendPositionPacket = function(){
    var positionPacket = "000";
    for(playerKey in PLAYER_LIST){
        PLAYER_LIST[playerKey].update();
        positionPacket += `${PLAYER_LIST[playerKey].pos[0]}*${PLAYER_LIST[playerKey].pos[1]}*${PLAYER_LIST[playerKey].state}@`;
    }
    for(playerKey in PLAYER_LIST){
        if(PLAYER_LIST[playerKey].port != 0){
            server.send(positionPacket, PLAYER_LIST[playerKey].port, PLAYER_LIST[playerKey].ipaddress);
        }
    }
}

setInterval(function(){
    sendPositionPacket();
},1000/20);