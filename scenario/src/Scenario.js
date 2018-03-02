/*Copyright (c) 2017-2018 Xavier Blanc <blancxav@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

import * as ActionFactory from './ActionFactory';
import WaitAction from './WaitAction.js';

export default class Scenario {

	constructor(actionsJSON) {
		this.actions = [];
		if (actionsJSON) {
			actionsJSON.forEach(ac => {
				this.addAction(ActionFactory.createAction(ac));
			});
		}
	}

	toString() {
		return `[${this.actions.join(', ')}]`;
	}

	toJSON() {
		return JSON.stringify(this.actions);
	}

	addAction(action) {
		this.actions.push(action);
	}

	get depth() {
		return this.actions.length;
	}

	duplicate() {
		var dupication = new Scenario();
		this.actions.forEach(ac => dupication.addAction(ac));
		return dupication;
	}

	equalsTo(scenario) {
		if (this.actions.length === scenario.actions.length) {
			for (var i = 0; i < this.actions.length; i++) {
				if (! this.actions[i].equalsTo(scenario.actions[i])) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	}

	async run(page) {
		let i;
		try {
			for (i=0 ; i < this.actions.length; i++) {
				await this.actions[i].run(page);
			}
			return {
				success : true,
				runnedActions : i
			}
		} catch(err) {
			return {
				success : false,
				runnedActions : i-1,
				error : err
			}
		}
	}
}
