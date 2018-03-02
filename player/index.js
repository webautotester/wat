const Player = require('./Player.js').Player;

const argv = require('yargs').argv;

const serverNames = {
	mongoServerName : argv.mongo,
	rabbitServerName : argv.rabbit    
};


var player = new Player(serverNames);
player.start();

    
