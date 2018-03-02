import React from 'react';
import { render } from 'react-dom';
import { PageHeader, Grid, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Route, browserHistory } from 'react-router-dom';
import Login from './Login.jsx';
import Logout from './Logout.jsx';
import Record from './Record.jsx';
import GitHub from './GitHub.jsx';

// This is a fix for wrong popup size on macos.
chrome.runtime.getPlatformInfo(info => {
	if (info.os === 'mac') {
		setTimeout(() => {
			// Increasing body size enforces the popup redrawing
			document.body.style.width = `${document.body.clientWidth + 1}px`;
		}, 500); // 250ms is enough to finish popup open animation
	}
});

class PopupPlugin extends React.Component {
	render() {
		return (
			<Router history={browserHistory}>
				<Grid fluid={true}>
					<Row>
						<Col lg={12}>
							<PageHeader>Web Automatic Tester</PageHeader>
							<p className="lead">Record your end to end test scenario.</p>
						</Col>
					</Row>
					<Row>
						<Col lg={12}>
							<Route exact path="/popup.html" component={Login}/>
							<Route path="/logout" component={Logout}/>
							<Route path="/record" component={Record}/>
							<Route path="/github" component={GitHub}/>
						</Col>
					</Row>
				</Grid>
			</Router>
		);
	}
}

render(<PopupPlugin/>, document.getElementById('app'));
