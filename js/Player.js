var KEYS = require('./config/keys.json');

class Player {
  constructor(ipaddress, id, socket) {
    this.socket = socket;
    this.ipaddress = ipaddress;
    this.id = id;
    this.pos = [0, 0];
    this.state = 0;
    this.speed = 4;
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
    var flag = false;
    var flag2 = -1;
      if(this.keypressed[KEYS.list.a]){
        this.direction[0] = -1;
        flag = true;
        flag2 = 1;
      }
      else if(this.keypressed[KEYS.list.d]){
        this.direction[0] = 1;
        flag = true;
        flag2 = 2;
      }
      else if(this.keypressed[KEYS.list.w]){
        this.direction[1] = -1;
        flag = true;
        flag2 = 3;
      }
      else if(this.keypressed[KEYS.list.s]){
        this.direction[1] = 1;
        flag = true;
        flag2 = 0;
      }
    this.pos[0] += this.speed * this.direction[0];
    this.pos[1] += this.speed * this.direction[1];
    this.updateState(flag);
    if(flag2 != -1){
      this.updateDirection(flag2);
    }
  }

  update(){
    this.move();
  }

  updateDirection(newDirection){
    if(newDirection != Math.floor(this.state/8)){
      this.state = newDirection * 8;
    }
  }

  updateKey(keyName, keyState){
      if(keyName in this.keypressed){
        this.keypressed[keyName] = keyState;
      }
  }

  updateState(isMoving){
    if(this.state < 8){
      if(isMoving){
        this.state += 1;
        if(this.state > 8){
          this.state = 0;
        }
      } else {
        this.state = 0;
      }
    } else if(this.state < 16){
      if(isMoving){
        this.state += 1;
        if(this.state > 16){
          this.state = 8;
        }
      } else {
        this.state = 8;
      }
    } else if(this.state < 24){
      if(isMoving){
        this.state += 1;
        if(this.state > 24){
          this.state = 16;
        }
      } else {
        this.state = 16;
      }
    } else if(this.state < 32){
      if(isMoving){
        this.state += 1;
        if(this.state > 32){
          this.state = 24;
        }
      } else {
        this.state = 24;
      }
    }
  }
}

module.exports = {Player};