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
      console.log(contents.split("\r\n"));
    }
  }

  
module.exports = {Room};