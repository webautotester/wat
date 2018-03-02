import { login , getJWTFromGitHubSession, postScenario } from './services.js';

class PageManager {
	constructor() {
		this.scenario = [];
		this.isRecording = false;
		this.isLoggedIn = false;
		this.windowId = 0;
		this.tabId = 0;
		this.handleMessage = this.handleMessage.bind(this);
		this.startRecording = this.startRecording.bind(this);
		this.startRecording = this.startRecording.bind(this);
		this.getRecordedScenarioAndStop = this.getRecordedScenarioAndStop.bind(this);
		this.reinitRecording = this.reinitRecording.bind(this);
		this.webNavigationCommitted = this.webNavigationCommitted.bind(this);
		this.webNavigationCompleted = this.webNavigationCompleted.bind(this);


		chrome.webNavigation.onCommitted.addListener(this.webNavigationCommitted);
		chrome.webNavigation.onCompleted.addListener(this.webNavigationCompleted);
	}

	start() {
		chrome.runtime.onMessage.addListener(this.handleMessage);
	}

	handleMessage(msg, sender, sendResponse) {
		switch (msg.kind) {
		case 'login':
			login(msg.credential)
				.then(response => {
					if (response.logged === false) {
						this.isLoggedIn = false;
					} else {
						this.isLoggedIn = true;
						this.jwt = response.jwt;
					}
					let responseToMsg = {isLoggedIn : this.isLoggedIn};
					sendResponse(responseToMsg);
				})
				.catch((ex) => {
					//console.log(ex);
					sendResponse(false);
				});
			return true;
		case 'github':
			getJWTFromGitHubSession(msg.code)
				.then(response => {
					if (response.logged === false) {
						this.isLoggedIn = false;
					} else {
						this.isLoggedIn = true;
						this.jwt = response.jwt;
					}
					let responseToMsg = {isLoggedIn : this.isLoggedIn};
					sendResponse(responseToMsg);
				})
				.catch((ex) => {
					//console.log(ex);
					sendResponse(false);
				});
			return true;
		case 'logout':
			this.isLoggedIn = false;
			this.jwt = undefined;
			break;
		case 'start':
			this.startRecording();
			break;
		case 'publish':
			var recordedScenario = this.getRecordedScenarioAndStop();
			postScenario(recordedScenario, this.jwt)
				.then( response => {
					sendResponse(response);
				})
				.catch( ex => {
					sendResponse(ex);
				});
			return true;
		case 'reinit':
			this.reinitRecording();
			break;
		case 'getState':
			sendResponse({
				isLoggedIn: this.isLoggedIn,
				isRecording: this.isRecording
			});
			break;
		case 'action' :
			if (this.isRecording) this.addActionToScenario(msg.action);
			break;
		}
	}

	startRecording() {
		this.scenario = [];
		this.isRecording = true;

		chrome.windows.getCurrent({populate:true}, window => {
			this.window = window;
			this.tab = window.tabs.find( tab => {return tab.active;});
			chrome.tabs.reload(this.tab.id);
		});
	}

	getRecordedScenarioAndStop() {
		this.isRecording = false;
		return   {
			actions : this.scenario,
			wait : 8000
		};
	}

	reinitRecording() {
		this.isRecording = false;
		this.scenario = [];
	}

	webNavigationCommitted({transitionType, url}) {
		if (transitionType === 'reload' || transitionType === 'start_page') {
			pageManager.scenario.push({type:'GotoAction', url:url});
		}
	}

	webNavigationCompleted({tabId, frameId}) {
		if (this.tab && (this.tab.id === tabId  ))  {
			if (frameId === 0) {
				chrome.tabs.executeScript(this.tab.id, {file:'listener.bundle.js'});
				chrome.tabs.executeScript(this.tab.id, {file:'favicon.js'});
			}
		}
	}

	addActionToScenario(action) {
		if (this.scenario.length > 0) {
			let lastAction = this.scenario[this.scenario.length - 1];
			if (lastAction.type === 'TypeAction' && action.type === 'TypeAction') {
				if (lastAction.selector.watId === action.selector.watId) {
					this.scenario.pop();	
				}
			}
		}
		this.scenario.push(action);
	}
}

var pageManager = new PageManager();
pageManager.start();
