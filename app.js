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
ID_LIST = {}
ID_VOC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
for (var i = 0; i < ID_VOC.length; i++) {
    for (var l = 0; l < ID_VOC.length; l++) {
        ID_LIST[ID_VOC.charAt(i) + ID_VOC.charAt(l)] = true;
    }
}

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
    for(var key in ID_LIST){
        if(ID_LIST[key]){
            socket.id = key;
            ID_LIST[key] = false;
            break;
        }
    }
	console.log("id generated as " + socket.id);
    //get ip of client
    ipvaddress = socket.handshake.address;
    if (ipvaddress.substr(0, 7) == "::ffff:") {
        ipvaddress = ipvaddress.substr(7);
    }

	var player = new p.Player(ipvaddress, socket.id, socket);
    PLAYER_LIST[socket.id] = player;

    socket.emit("id", socket.id);

	socket.on('keyPressed',function(data){
        player.updateKey(data[0], data[1])
    });

	socket.on('disconnect',function(){
          delete PLAYER_LIST[socket.id];
          ID_LIST[socket.id] = true;
		  console.log(socket.id + " left the game");
    });

    socket.on('info',function(data){
		  console.log(`${data} from ${player.ipaddress}`);
    });

    socket.on('speech',function(data){
        boardcastAll(`001${player.id}${data}`);
    });

    socket.on('port',function(data){
        player.port = data;
  });
});

//setup udp server
server.bind(udp_port);
console.log(`App listening udp at localhost:${udp_port}`)

function boardcastAll(dataPacket){
    for(playerKey in PLAYER_LIST){
        if(PLAYER_LIST[playerKey].port != 0){
            server.send(dataPacket, PLAYER_LIST[playerKey].port, PLAYER_LIST[playerKey].ipaddress);
        }
    }
}

var sendPositionPacket = function(){
    for(playerKey in PLAYER_LIST){
        PLAYER_LIST[playerKey].update();
    }

    for(playerKey in PLAYER_LIST){
        if(PLAYER_LIST[playerKey].port != 0){
            PLAYER_LIST[playerKey].positionData = "000";
            for(targetKey in PLAYER_LIST){
                PLAYER_LIST[playerKey].positionData += `${PLAYER_LIST[targetKey].id}*${PLAYER_LIST[targetKey].pos[0]-PLAYER_LIST[playerKey].pos[0]}*${PLAYER_LIST[targetKey].pos[1]-PLAYER_LIST[playerKey].pos[1]}*${PLAYER_LIST[targetKey].state}@`;
            }
            server.send(PLAYER_LIST[playerKey].positionData, PLAYER_LIST[playerKey].port, PLAYER_LIST[playerKey].ipaddress);
        }
    }
}

setInterval(function(){
    sendPositionPacket();
},1000/20);