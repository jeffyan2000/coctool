var KEYS = require('./config/keys.json');

class Player {
  constructor(ipaddress, id, socket) {
    this.socket = socket;
    this.ipaddress = ipaddress;
    this.id = id;
    this.pos = [0, 0];
    this.state = 0;
    this.speed = 5;
    this.keypressed = {};
    this.direction = [0, 0];
    this.init();
  }

  init(){
      for (var key in KEYS.list) {
        this.keypressed[KEYS.list[key]] = false;
    }
  }

  move(){
    this.direction[0] = 0;
    this.direction[1] = 0;
      if(this.keypressed[KEYS.list.a]){
        this.direction[0] = -1;
      }
      else if(this.keypressed[KEYS.list.d]){
        this.direction[0] = 1;
      }
      else if(this.keypressed[KEYS.list.w]){
        this.direction[1] = -1;
      }
      else if(this.keypressed[KEYS.list.s]){
        this.direction[1] = 1;
      }
    this.pos[0] += this.speed * this.direction[0];
    this.pos[1] += this.speed * this.direction[1];
  }

  update(){
    this.move();
  }

  updateKey(keyName, keyState){
      if(keyName in this.keypressed){
        this.keypressed[keyName] = keyState;
      }
  }
}

module.exports = {Player};