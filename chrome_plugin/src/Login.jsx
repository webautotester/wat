import React from 'react';
import { Redirect } from 'react-router-dom';
import { Form, Col, FormGroup, FormControl, ControlLabel, Button, Alert } from 'react-bootstrap';

const CLIENT_ID = '28bd9c230cad1275362f';

export default class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			credential : {
				username : '',
				password : ''
			},
			message: null,
			isLoggedIn : false
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleGitHub = this.handleGitHub.bind(this);
	}

	componentDidMount() {
		chrome.runtime.sendMessage({kind:'getState'}, response => {
			this.setState(prevState => {
				return {
					credential : prevState.credential,
					isLoggedIn : response.isLoggedIn,
					message: null
				};
			});
		});
	}

	handleSubmit(event) {
		event.preventDefault();
		var button = document.getElementById('loginButton');
		var span = document.createElement('span');
		span.setAttribute('class', 'glyphicon glyphicon-refresh glyphicon-refresh-animate');
		button.insertBefore(span, button.firstChild);
		var credential = {
			username: document.getElementById('username').value,
			password: document.getElementById('password').value
		};
		chrome.runtime.sendMessage({ kind: 'login' , credential: credential }, (response) => {
			console.log(`isLogged:${response.isLoggedIn}`);
			if (response.isLoggedIn) {
				this.setState(() => {
					return {
						credential: credential,
						isLoggedIn : true,
						message : null
					};
				});
				button.removeChild(span);
			} else {
				this.setState(() => {
					return {
						credential: credential,
						isLoggedIn : false,
						message : 'Invalid username or password.'
					};
				});
				button.removeChild(span);
			}
		});
	}

	handleGitHub(event) {
		event.preventDefault();
		const AUTH_URL = 'https://github.com/login/oauth/authorize/?client_id='+CLIENT_ID;
		chrome.identity.launchWebAuthFlow({'url': AUTH_URL, 'interactive': true},
			(redirect_url) => { /* Extract token from redirect_url */ 
				let codeBeginIndex = redirect_url.lastIndexOf('code=') + 5;
				let code = redirect_url.substring(codeBeginIndex);
				console.log(code);
				chrome.runtime.sendMessage({ kind: 'github', code: code}, (response) => {
					if (response.isLoggedIn) {
						this.setState(() => {
							return {
								isLoggedIn : true,
								message : null
							};
						});
					} else {
						this.setState(() => {
							return {
								isLoggedIn : false,
								message : 'Invalid GitHub username or password.'
							};
						});
					}

				});
			}
		);
	}

	render() {
		let gitHub;
		if (process.env.NODE_ENV === 'debug') {
			gitHub = <br/>;
		} else {
			gitHub = <a href="#" onClick={this.handleGitHub}> Or Log With Your GitHub Account </a>;
		}
		
		if (this.state.isLoggedIn) {
			return <Redirect to="/record"/>;
		} else {
			return (
				<Form horizontal onSubmit={this.handleSubmit}>
					<FormGroup>
						<Col xs={2}><ControlLabel>Username</ControlLabel></Col>
						<Col xs={10}>
							<FormControl id="username" type="text" value={this.state.username}/>
						</Col>
					</FormGroup>
					<FormGroup>
						<Col xs={2}><ControlLabel>Password</ControlLabel></Col>
						<Col xs={10}>
							<FormControl id="password" type="password" value={this.state.password}/>
						</Col>
					</FormGroup>
					{this.state.message &&
						<FormGroup>
							<Col xsOffset={2} xs={10}><Alert bsStyle="danger">{this.state.message}</Alert></Col>
						</FormGroup>
					}
					<FormGroup>
						<Col xsOffset={2} xs={10}><Button id="loginButton" bsStyle="primary" type="submit">Login</Button></Col>
					</FormGroup>
					{gitHub}
				</Form>
			);
		}

	}
}
