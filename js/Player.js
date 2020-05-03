var KEYS = require('./config/keys.json');

class Player {
  constructor(ipaddress, id, socket) {
    this.socket = socket;
    this.ipaddress = ipaddress;
    this.id = id;
    this.pos = [0, 0];
    this.speed = 5;
    this.keypressed = {};
  }

  init(){
      for (var key in KEYS.list) {
        this.keypressed[KEYS.list[key]] = false;
    }
  }

  move(){

  }
}

module.exports = {Player};