const winston = require('winston');
const amqp = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const Crontab = require('crontab');
const QUEUE_NAME = 'wat_queue';

module.exports.init = function(serverNames, webServer) {
	const dbUrl = `mongodb://${serverNames.mongoServerName}:27017/wat_storage`;
	const rmqUrl = `amqp://${serverNames.rabbitServerName}`;
	webServer
		.get('/playNow/:sid', (req, res) => {
			playNow(req,res, req.params.sid);
		})
		.get('/schedule/:sid', (req, res) => {
			//each minute for test purpose
			//will be each day in beta production
			const options = {
				cron : '0 6 * * *',
				sid : req.params.sid
			};
			addCron(req,res, options);
		})
		.get('/unschedule/:sid', (req, res) => {//daily
			removeCron(req,res, req.params.sid);
		})
		.get('/isscheduled/:sid', (req, res) => {
			isScheduled(req, res, req.params.sid);
		});

	function playNow(req, res, sid) {
		winston.info(`Play Now Request on ${dbUrl}`);
		MongoClient.connect(dbUrl)
			.then(db => {
				db.collection('scenario', (err, scenarioCollection) => {
					if (err) {
						winston.error(`Play Now Request Error : ${err}`);
						db.close();
						res.status(404).send(err).end();
					} else {
						winston.info(`Launch promise ${sid}`);
						var firstPromise = scenarioCollection.find({_id:new ObjectID(sid)}).toArray();
						var secondPromise = amqp.connect(rmqUrl)
							.then( conn => {
								return conn.createConfirmChannel();
							})
							.catch( e=> {
								return Promise.reject(e);
							});
						Promise.all([firstPromise,secondPromise])
							.then(promizesResults => {
								winston.info('Play Now Request ');
								var scenarioToPlay = promizesResults[0][0];
								var channel = promizesResults[1];
								var msg = JSON.stringify(scenarioToPlay);
								winston.info(msg);
								channel.assertQueue(QUEUE_NAME, { durable: true })
									.then(ok => {
										if (ok) {
											return channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {persistent: true});
										} else {
											return Promise.reject(ok);
										}
									})
									.then(() => {
										channel.close();
										db.close();
										res.status(200).send(`play request sent for scenario ${sid}`).end();
									})
									.catch ((err) =>{
										channel.close();
										db.close();
										winston.error(err);
										res.status(500).send(`play request cannot be sent : ${err}`);
									});
							})
							.catch(err => {
								db.close();
								res.status(500).send(err).end();
							});
					}
				});
			
			}).catch(err => {
				winston.info(err);
				res.send(err).status(500).end;
			});
	}

	function addCron(req, res, playOptions) {
		const cron = playOptions.cron;
		const comment = playOptions.sid;
		winston.info(`Add new cron for scenario (${playOptions.sid}) with cron ${cron}`);
		if (cron) {
			Crontab.load((err, ct) => {
				// create with string expression
				const NODE_BIN = '/usr/local/bin/node';
				const NODE_SCRIPT = '/tmp/scheduler/sendPlayMessage.js';
				const NODE_OPTIONS = `--mongo=mongo --rabbit=rabbit --sid=${playOptions.sid}`;
				const LOG = '>> /var/log/watcron.log 2>&1';
				ct.create(`${NODE_BIN} ${NODE_SCRIPT} ${NODE_OPTIONS} ${LOG}`, cron, comment);
				
				ct.save((err) => {
					if (err) {
						res.status(500).send(err).end();
					}
					else {
						res.status(200).send(`cron request sent for scenario ${playOptions.sid}`).end();
					}
				}); 
			});
		} else {
			res.status(500).send(`cron ${cron} is not valid`).end();
		}
	}

	function removeCron(req, res, sid) {
		winston.info(`Remove cron for scenario (${sid})`);
		
		Crontab.load((err, ct) => {
			ct.remove({comment: sid});
			ct.save((err) => {
				if (err) {
					res.status(500).send(err).end();
				}
				else {
					res.status(200).send(`${sid} removed from the list`).end();
				}
			}); 
		});
	}

	function isScheduled(req, res, sid) {
		winston.info(`Check if (${sid}) is scheduled`);
		Crontab.load((err, ct) => {
			const jobs = ct.jobs({comment: sid});
			if ( jobs && jobs.length > 0 ) {
				res.status(200).send(true).end();
			} else {
				res.status(200).send(false).end();
			}
		});
	}
	
};