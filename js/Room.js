const fs = require('fs');
const path = require('path');

class Interactables {
  constructor(hitbox, trigger, action){
    this.hitbox = hitbox;
    this.trigger = trigger;
    this.action = action;
  }

  isTriggeredBy(player){
    if(this.trigger == "hit"){
      if(this.hitbox){
        
      }
    }
  }
}

class Room {
    constructor(startposition) {
      this.players = {};
      this.id = Math.random();
      this.hitboxes = [];
      this.startpos = [startposition[0], startposition[1]];
      this.tileSize = 48;
      this.mapSize = [0, 0];
      this.items = {};
    }

    dropItem(item, pos){
      this.items[item.id] = item;
      this.items[item.id].drop(pos);
    }

    update(){
      for(playerKey in this.players){
        var player = this.players[playerKey];
        if(player.ready()){
          var tempPos = [0, 0];
          tempPos[0] = player.pos[0];
          tempPos[1] = player.pos[1];
          player.update();

          var tempPoints = player.getGridPos(this.tileSize);
          
          if((tempPoints[0] >= this.mapSize[1] || tempPoints[0] < 0) ||
              (tempPoints[1] >= this.mapSize[1] || tempPoints[1] < 0) ||
              (tempPoints[2] >= this.mapSize[0] || tempPoints[2] < 0) ||
              (tempPoints[3] >= this.mapSize[0] || tempPoints[3] < 0)){
                player.setPos(tempPos[0], tempPos[1]);
              }
          
          else if(this.hitboxes[tempPoints[0]][tempPoints[2]] != "0" ||
            this.hitboxes[tempPoints[1]][tempPoints[2]] != "0" || 
            this.hitboxes[tempPoints[0]][tempPoints[3]] != "0" ||
            this.hitboxes[tempPoints[1]][tempPoints[3]] != "0"){
            player.setPos(tempPos[0], tempPos[1]);
          }
        }
      }
    }

    addPlayer(player){
      this.players[player.id] = player;
      this.players[player.id].setPos(this.startpos[0], this.startpos[1]);
    }

    removePlayer(player){
      delete this.players[player.id];
    }

    read_from(name){
      var contents = fs.readFileSync(path.join("maps", name + ".hitbox"), 'utf8');
      contents = contents.split("\r\n");
      for(var line in contents){
        if(contents[line]){
          this.hitboxes.push([]);
          this.mapSize[1] += 1;
          contents[line] = contents[line].split(",");
          for(var tile in contents[line]){
            if(contents[line][tile]){
              this.hitboxes[line].push(contents[line][tile]);
            }
          }
        }
      }
      this.mapSize[0] = this.hitboxes[0].length;
    }
  }

  
module.exports = {Room};