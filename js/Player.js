var KEYS = require('./config/keys.json');

class Item {
  constructor(id){
    this.id = id;
    this.dropped = false;
    this.pos = [0, 0]
  }

  drop(pos){
    this.dropped = true;
    this.pos[0] = pos[0];
    this.pos[1] = pos[1]; 
  }
}

class BackPack {
  constructor(size){
    this.size = size;
    this.slots = [];
    this.grabbed = null;
    for(var i = 0; i < size; i++){
      this.slots.push(null);
    }
    this.slots[0] = 1;
    this.slots[1] = 2;
  }

  switchItem(slot){
    var temp = this.grabbed;
    this.grabbed = this.slots[slot];
    this.slots[slot] = temp;
  }

  prepareInfoPack(){
    var temp = "";
    for(var slot in this.slots){
      temp += "@";
      if(this.slots[slot]){
        temp += `${this.slots[slot]}`;
      }
    }
    return temp;
  }
}

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
    this.port = 0;
    this.name = "";
    this.skin = "";
    this.init();
    this.room = null;

    this.backpack = new BackPack(24);

    this.positionData = "";
  }

  getGridPos(tileSize){
    return [Math.floor((player.pos[1]+60)/tileSize), Math.floor((player.pos[1]+75)/tileSize),
                            Math.floor((player.pos[0]+20)/tileSize), Math.floor((player.pos[0]+60)/tileSize)];
  }

  init(){
      for (var key in KEYS.list) {
        this.keypressed[KEYS.list[key]] = false;
    }
  }

  requestSlotRotate(slot){
    this.backpack.switchItem(slot);
  }

  ready(){
    if(this.name != "" && this.port != 0 && this.skin != ""){
      return true;
    }
    return false;
  }

  setPos(x, y){
    this.pos[0] = x;
    this.pos[1] = y;
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

module.exports = {Player, Item, BackPack};