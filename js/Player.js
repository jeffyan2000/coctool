class Player {
  constructor(ipaddress) {
    this.ipaddress = ipaddress;
    this.id = Math.random();
  }
}

module.exports = {Player};