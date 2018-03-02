const winston = require('winston');
const Nightmare = require('nightmare');
const amqp = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const wat_action = require('wat_action_nightmare');
const QUEUE_NAME = 'wat_queue';

const TIME_OUT = 40000;

function Player (serverNames) {
	this.dbUrl = `mongodb://${serverNames.mongoServerName}:27017/wat_storage`;
	this.rmqUrl = `amqp://${serverNames.rabbitServerName}`;
	winston.info(`New Player (${this.dbUrl}) (${this.rmqUrl})`);

	this.start = start;
}

	


function start() {
	winston.info('Player Started');
	amqp.connect(this.rmqUrl)
		.then(conn => {
			winston.info('connected');
			this.connection = conn;
			return conn.createConfirmChannel();
		})
		.then(ch => {
			winston.info('channel created');
			this.ch = ch;
			this.ch.assertQueue(QUEUE_NAME, { durable: true });
			winston.info('Queue Created');
			this.ch.prefetch(1);
			this.ch.consume(QUEUE_NAME, scenarioMsg => {
				if (scenarioMsg !== null) {
					playScenario.call(this, scenarioMsg);
				}
			});
		})
		.catch(err => {
			winston.info(err);
			setTimeout(() => {
				this.start(); 
			}, 2000);
		});
}

function playScenario(scenarioMsg) {
	const scenarioContent = JSON.parse(scenarioMsg.content.toString());
	winston.info(`Player Begins To Play A Scenario : ${scenarioContent._id}`);
	const actions = createWATScenario(scenarioContent);
	const scenario = new wat_action.Scenario(actions);
	winston.info(scenario.toString());
	const browser = new Nightmare({show:true, loadTimeout: TIME_OUT , gotoTimeout: TIME_OUT, switches:{'ignore-certificate-errors': true}});
	scenario.attachTo(browser)
		.evaluate( (assert) => {
			if (assert && !assert.end) {
				var testedElement = document.querySelector(assert.selector);
				var obtained;
				switch (assert.property) {
				case 'value' : obtained = testedElement.value;
					break;
				case 'innerHTML' : obtained = testedElement.innerHTML;
					break;
				default : obtained = '';
				}
				return obtained.indexOf(assert.contains) !== -1;
			} else {
				return true;
			}
		},scenarioContent.assert)
		.then((testResult) => {
			winston.info('Scenario Success');
			var _id = ObjectID();
			var path = `/tmp/run/screen/${_id}.png`;
			browser.screenshot(path).end().then();
			if (testResult) {
				recordSuccessfulRun.call(this, scenarioMsg, _id);
			} else {
				var error = 'assertion fails';
				recordErrorRun.call(this, scenarioMsg, _id, error);	
			}
		})
		.catch((e) => {
			winston.info('Scenario Error');
			winston.info(e);
			var _id = ObjectID();
			var path = `/tmp/run/screen/${_id}.png`;
			browser.screenshot(path).end().then();
			recordErrorRun.call(this, scenarioMsg, _id, e);
		});
}

function createWATScenario(scenario) {
	var wait = scenario.wait || 0;
	var actions = [];
	scenario.actions.forEach((action) => {
		var watAction = {
			type: action.type
		};
		watAction.url = action.url || undefined;
		watAction.text = action.text || undefined;
		watAction.selector = action.selector;
		actions.push(watAction);
	});

	if (wait > 0) {
		var actionsWithWait = [];
		for (let index = 0; index < actions.length ; index++) {
			actionsWithWait.push(actions[index]);
			actionsWithWait.push({
				type: 'WaitAction',
				ms: Number(wait)
			});
		}
		return actionsWithWait;
	} else {
		return actions;
	}
}

function recordSuccessfulRun(scenarioMsg, _id) {
	winston.info('Record Successful Run');
	var scenarioObj = JSON.parse(scenarioMsg.content.toString());
	var sid = scenarioObj._id;
	var uid = scenarioObj.uid;
	MongoClient.connect(this.dbUrl)
		.then(db => {
			db.collection('run', (err, runCollection) => {
				if (err) {
					winston.error(err);
				} else {
					var newRun = {
						sid : new ObjectID(sid),
						uid : new ObjectID(uid),
						isSuccess : true,
						read : false,
						date : new Date().toJSON(),//.slice(0,10).replace(/-/g,'/');
						_id : _id
					};
					runCollection.save(newRun)
						.then(() => {
							winston.info('Successful Run Has Been Saved');
							this.ch.ack(scenarioMsg);
						}).catch(err => {
							winston.error(err);
						});
				}
			});
		}).catch(err => {
			winston.error(err);
		});
}

function recordErrorRun(scenarioMsg, _id, error) {
	var scenarioObj = JSON.parse(scenarioMsg.content.toString());
	var sid = scenarioObj._id;
	var uid = scenarioObj.uid;
	winston.info(`Record Error Run of scenario ${sid}`);
	MongoClient.connect(this.dbUrl)
		.then(db => {
			db.collection('run', (err, runCollection) => {
				if (err) {
					winston.error(err);
				} else {
					var newRun = {
						sid : new ObjectID(sid),
						uid : new ObjectID(uid),
						isSuccess : false,
						read : false,
						error : error,
						date : new Date().toJSON(),//.slice(0,10).replace(/-/g,'/');
						_id : _id  
					};
					runCollection.save(newRun)
						.then( () => {
							winston.info('Error Run Has Been Saved');
							this.ch.ack(scenarioMsg);
						}).catch(err => {
							winston.error(err);
						});
				}
			});
		}).catch(err => {
			winston.error(err);
		});
}


module.exports.Player = Player;