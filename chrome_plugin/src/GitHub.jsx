import React from 'react';
import { Redirect } from 'react-router-dom';

export default class GitHub extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			waiting : true,
			isLoggedIn : false
			
		};
	}
    
	componentDidMount() {
		chrome.runtime.sendMessage({kind:'github'}, response => {
			this.setState(() => {
				return {
					waiting : false,
					isLoggedIn : response.isLoggedIn
      			};
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
			if (this.state.isLoggedIn) {
				return <Redirect to="/"/>;
			} else {
				return <Redirect to="/login"/>;
			}
		}
	}
}
