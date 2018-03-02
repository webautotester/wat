import React from 'react';
import {isLoggedIn, getJWTFromGitHubSession} from './authenticationService.js';
import { Redirect } from 'react-router-dom';

export default class GitHub extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			waiting : true,
			itGetsAJWT : false
			
		};
	}
    
	componentDidMount() {
		console.log('will mount');
		getJWTFromGitHubSession()
			.then( itGetsAJWT => {
				this.setState({
					waiting: false,
					itGetsAJWT: itGetsAJWT
				});
				
			})
			.catch ( (err) => {
				console.log(err);
				this.setState({
					waiting: false,
					itGetsAJWT: false
				});
			});
	}


	render() {
		//console.log(`redirect:${this.state.redirect}`);
		if (this.state.waiting) {
			return (
				<div>Waiting for GitHub authentication !</div>
			);  
			
		} else {
			if (this.state.itGetsAJWT) {
				return <Redirect to="/"/>;
			} else {
				return <Redirect to="/login"/>;
			}
		}
	}
}
