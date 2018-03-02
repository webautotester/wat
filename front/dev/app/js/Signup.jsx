import React from 'react';
import {isLoggedIn, signup} from './authenticationService.js';

import { FormGroup, FormControl, ControlLabel, Button, Alert, Row, Image, Grid, Col} from 'react-bootstrap';

export default class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			credential : {
				username : '',
				password : ''
			},
			message : null
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		var eventID = event.target.id;
		var eventValue = event.target.value;   
		this.setState( (prevState) => {
			switch (eventID) {
			case 'username' : return { 
				credential: {
					username: eventValue, 
					password: prevState.credential.password
				},
				message: null};
			case 'password' : return {
				credential: {
					username: prevState.credential.username, 
					password: eventValue
				},
				message: null};
			}
		});
	}

	handleSubmit(event) {
		event.preventDefault();
		signup(this.state.credential)
			.then((message) => {
				this.setState( prevState => {
					return {
						credential: prevState.credential,
						message: message
					};
				});
			})
			.catch( (err) => {
				this.setState( prevState => {
					return {
						credential: prevState.credential,
						message: 'ERROR'
					};
				});
			});
    
	}

	render() {
		//console.log('render');
		if (isLoggedIn()) {
			return (
				<Alert bsStyle="success">
					<strong>You are already logged in !</strong>
				</Alert>
			);
		} else {
			let errorMessage;
			if (this.state.message) {
				errorMessage = <Alert bsStyle="warning">
					<strong>{this.state.message}</strong>
				</Alert>;
			}
			return (
				<Grid>
					<Row>
						<Col xs={12} md={8}>
							<form onSubmit={this.handleSubmit} className="centered-form">
							Create Your WAT Account
								<FormGroup>
									<ControlLabel>Username</ControlLabel>
									<FormControl id="username" type="text" value={this.state.username} onChange={this.handleChange}/>
								</FormGroup>
								<FormGroup>
									<ControlLabel>Password</ControlLabel>
									<FormControl id="password" type="password" value={this.state.password} onChange={this.handleChange}/>
								</FormGroup>
								<Button type="submit">Sign Up</Button>
								{errorMessage}
							</form>
						</Col>
						<Col xs={6} md={4}>
							With Your GitHub Account
							<br/>
							<a href="api/github"> <Image src="img/github.png" width="100" rounded/></a>
						</Col>
					</Row>
				</Grid>
			);
		}
	}
}
