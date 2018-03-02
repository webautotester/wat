const winston = require('winston');
const amqp = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const QUEUE_NAME = 'wat_queue';

const argv = require('yargs').argv;
const serverNames = {
	mongoServerName : argv.mongo,
	rabbitServerName : argv.rabbit    
};
const sid = argv.sid;

const dbUrl = `mongodb://${serverNames.mongoServerName}:27017/wat_storage`;
const rmqUrl = `amqp://${serverNames.rabbitServerName}`;

playNow(sid);

function playNow(sid) {
	MongoClient.connect(dbUrl)
		.then(db => {
			db.collection('scenario', (err, scenarioCollection) => {
				if (err) {
					db.close();
					winston.error(err);
				} else {
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
							winston.info('Play Crone Request ');
							var scenarioToPlay = promizesResults[0][0];
							var channel = promizesResults[1];
							var msg = JSON.stringify(scenarioToPlay);
							winston.info(msg);
							channel.assertQueue(QUEUE_NAME, { durable: true })
								.then(ok => {
									if (ok) {
										channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {persistent: true}, (err, succ) => {
											winston.info(`Cron request sent for scenario ${sid}`);
											process.exit();
											return succ;
										});
									} else {
										return Promise.reject(ok);
									}
								}).then(() => {
									db.close();						
								});
						})
						.catch(err => {
							winston.error(err);
							process.exit();
						});
				}
			});
		}).catch(err => {
			winston.error(err);
			process.exit();
		});
}

	