const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require('express');

//import custom modules
const p = require('./js/Player.js');
const r = require('./js/Room.js');

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

var room = new r.Room([480, 480]);
room.read_from("default");

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
    room.addPlayer(player);
    PLAYER_LIST[socket.id] = player;

    socket.emit("id", socket.id);

    var prevInfoPack = "";
    for(playerKey in PLAYER_LIST){
        if(playerKey != player.id){
            prevInfoPack += `${PLAYER_LIST[playerKey].name}*${PLAYER_LIST[playerKey].skin}*${playerKey}@`;
        }
    }
    socket.emit("new_players", prevInfoPack);

	socket.on('keyPressed',function(data){
        if(data[1] == "0"){
            player.updateKey(data[0], false)
        }
        else{
            player.updateKey(data[0], true)
        }
    });

    socket.on('backpackOperation',function(data){
        player.requestSlotRotate(data);
    });

    /*
        1 for backpack gui
    */
    socket.on('requestOpenGui', function(data){
        if(data == "1"){
            socket.emit('openGui', "1"+player.backpack.prepareInfoPack());
        }
    });

	socket.on('disconnect',function(){
          room.removePlayer(player);
          delete PLAYER_LIST[socket.id];
          ID_LIST[socket.id] = true;
          console.log(socket.id + " left the game");
          boardcastAllSockets("remove_player", player.id);
    });

    socket.on('info',function(data){
          var player_info = data.split("@");
          player.name = player_info[0];
          player.skin = player_info[1];
          boardcastAllSockets("new_player", data+"@"+player.id);
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

function boardcastAllSockets(title, dataPacket){
    for(playerKey in PLAYER_LIST){
        PLAYER_LIST[playerKey].socket.emit(title, dataPacket);
    }
}

var sendPositionPacket = function(){
    room.update();

    for(playerKey in PLAYER_LIST){
        if(PLAYER_LIST[playerKey].ready()){
            PLAYER_LIST[playerKey].positionData = `000!*${PLAYER_LIST[playerKey].pos[0]}*${PLAYER_LIST[playerKey].pos[1]}@`;
            var mapSize = [room.tileSize*room.mapSize[0], room.tileSize*room.mapSize[1]];
            var tempPos = [PLAYER_LIST[playerKey].pos[0], PLAYER_LIST[playerKey].pos[1]];
            if(tempPos[1] - 217 < 0){
                tempPos[1] -= tempPos[1] - 217;
            } else if(tempPos[1] + 283 > mapSize[1]){
                tempPos[1] -= tempPos[1] + 283 - mapSize[1];
            }
            if(tempPos[0] - 267 < 0){
                tempPos[0] -= tempPos[0] - 267;
            } else if(tempPos[0] + 333 > mapSize[0]){
                tempPos[0] -= tempPos[0] + 333 - mapSize[0];
            }
            for(targetKey in room.players){
                if(PLAYER_LIST[playerKey].ready()){
                    PLAYER_LIST[playerKey].positionData += `${PLAYER_LIST[targetKey].id}*${PLAYER_LIST[targetKey].pos[0]-tempPos[0]}*${PLAYER_LIST[targetKey].pos[1]-tempPos[1]}*${PLAYER_LIST[targetKey].state}@`;
                }
            }
            server.send(PLAYER_LIST[playerKey].positionData, PLAYER_LIST[playerKey].port, PLAYER_LIST[playerKey].ipaddress);
        }
    }
}

setInterval(function(){
    sendPositionPacket();
},1000/20);