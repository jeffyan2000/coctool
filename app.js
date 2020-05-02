const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const express = require('express');

const Player = require('./js/Player.js');

const app = express();
const port = 3000;

var PLAYER_LIST = {};

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  server.send(Buffer.from('Some bytes'), 5005, 'localhost');
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);