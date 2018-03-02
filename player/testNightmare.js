const winston = require('winston');
const Nightmare = require('nightmare');
const wat_action = require('wat_action_nightmare');

const browser = new Nightmare({show:false, loadTimeout: 2000 , gotoTimeout: 3000, switches:{'ignore-certificate-errors': true}});
browser.goto('http://www.labri.fr')
	.then(() => {
		winston.info('Scenario Success');
		browser.end().then();
	})
	.catch((e) => {
		winston.info('Scenario Error');
		winston.info(e);
		browser.end().then();
	});

