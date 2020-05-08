const fs = require('fs');
const path = require('path');

class Room {
    constructor() {
      this.players = {};
      this.id = Math.random();
      this.hitboxes = []
    }

    read_from(name){
      var contents = fs.readFileSync(path.join("maps", name + ".hitbox"), 'utf8');
      contents = contents.split("\r\n");
      for(var line in contents){
        if(contents[line]){
          this.hitboxes.push([]);
          contents[line] = contents[line].split(",");
          for(var tile in contents[line]){
            if(contents[line][tile]){
              this.hitboxes[line].push(contents[line][tile]);
            }
          }
        }
      }
    }
  }

  
module.exports = {Room};