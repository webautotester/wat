import axios from 'axios';

export function login(credentials) {
	return new Promise( (resolve, reject) => {
		const url = `${BASE_URL}/api/login`;
		axios.post(url, credentials  )
			.then( response => {
				if (response.status === 200 ) {
					console.log('correct');
					resolve({
						logged : true,
						jwt: response.data.jwt
					});
				} else {
					console.log('incorrect');
					resolve({
						logged : false
					});
				}
			})
			.catch((ex) => {
				console.log('incorrect');
				reject(ex);
			});
	});
}

export function postScenario(scenario, jwt) {
	return new Promise((resolve, reject) => {
		const url = `${BASE_URL}/api/scenario`;
		axios.post(url, scenario, {headers: {'Authorization': `Bearer ${jwt}`}})
			.then( response => {
				resolve(response.data);
			})
			.catch(err => {
				reject(err);
			});
	});
}

export function getJWTFromGitHubSession(code) {
	return new Promise((resolve, reject) => {
		const url = `${BASE_URL}/api/github/plugin`;
		axios.post(url, {code:code})
			.then(response => {
				if (response.status === 401) {
					resolve({
						logged : false
					});
				} else {
					resolve({
						logged : true,
						jwt: response.data.jwt
					});
				}
			})
			.catch(err => {
				reject(err);
			});
	});
}

