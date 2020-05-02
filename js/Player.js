var KEYS = require('./config/keys.json');

class Player {
  constructor(ipaddress) {
    this.ipaddress = ipaddress;
    this.id = Math.random();
    this.pos = [0, 0];
    this.speed = 5;
    this.keypressed = {};
  }

  init(){
      for (var key in KEYS.list) {
        this.keypressed[key] = false;
    }
  }

  move(){

  }
}

module.exports = {Player};