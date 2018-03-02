import React from 'react';
import { Redirect } from 'react-router-dom';
import { ButtonToolbar, Button, Row } from 'react-bootstrap';

export default class Record extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			start: false,
			publish: true,
			reinit: true,
			redirect: false,
			selector: ''
		};
		this.clickStart = this.clickStart.bind(this);
		this.clickPublish = this.clickPublish.bind(this);
		this.clickReinit = this.clickReinit.bind(this);
		this.clickLogout = this.clickLogout.bind(this);
	}

	componentDidMount() {
		chrome.runtime.sendMessage({kind:'getState'}, response => {
			this.setState( () => {
				return {
					start: response.isRecording ,
					publish: !response.isRecording ,
					reinit: !response.isRecording,
					redirect: false
				};
			});
		});
	}

	clickStart(event) {
		event.preventDefault();
		chrome.runtime.sendMessage({kind:'start'});
		this.setState( () => {
			return {
				start: true ,
				publish: false ,
				reinit: false ,
				redirect: false
			};
		});
	}

	clickPublish(event) {
		event.preventDefault();
		console.log('start publish');
		chrome.runtime.sendMessage({kind:'publish'}, () => {
			console.log('publish ok');
			this.setState( () => {
				return {
					start: false ,
					publish: true ,
					reinit: true ,
					redirect: false
				};
			});
		});
	}

	clickReinit(event) {
		event.preventDefault();
		chrome.runtime.sendMessage({kind:'reinit'});
		this.setState( () => {
			return {
				start: false ,
				publish: true ,
				reinit: true ,
				redirect: false
			};
		});
	}

	clickLogout(event) {
		event.preventDefault();
		chrome.runtime.sendMessage({kind:'logout'});
		this.setState( () => {
			return {
				redirect : true
			};
		});
	}

	render() {
		if (this.state.redirect) {
			return <Redirect to="/popup.html"/>;
		}
		else {
			if (this.state.start) {
				return (
					<div>
						<ButtonToolbar>
							<Button bsStyle="primary" onClick={this.clickPublish}>Publish</Button>
							<Button bsStyle="danger" onClick={this.clickReinit}>Delete</Button>
							<Button bsStyle="danger" onClick={this.clickLogout}>Logout</Button>
						</ButtonToolbar>
					</div>
				);
			}
			else {
				return (
					<ButtonToolbar>
						<Button bsStyle="primary" onClick={this.clickStart}>Record</Button>
						<Button bsStyle="danger" onClick={this.clickLogout}>Logout</Button>
					</ButtonToolbar>
				);
			}
		}
	}
}
