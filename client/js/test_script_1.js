const dgram = require('dgram');
const message = Buffer.from('Some bytes');
const client = dgram.createSocket('udp4');

alert("hihi");
client.send(message, 41234, 'localhost', (err) => {
  client.close();
});