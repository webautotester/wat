const winston = require('winston');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const argv = require('yargs').argv;
const serverNames = {
    mongoServerName : argv.mongo,
    rabbitServerName : argv.rabbit    
}

var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

var fs = require('fs');
var RouteDir = 'routes';
var files = fs.readdirSync(RouteDir);

files.forEach(function(file) {
	var filePath = path.resolve('./', RouteDir, file);
	var route = require(filePath);
	route.init(serverNames, app);
});

app.listen(8090, function() {
	winston.info('wat_scheduler is listenning on port 8090');
});