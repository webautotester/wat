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

import Scenario from './Scenario';

export default class CandidateActionScenario extends Scenario {

	constructor(actionsJSON) {
		super(actionsJSON);
    }
    
    async scanCandidateAction(browser, browserKind) {
        let i;
		try {
			for (i=0 ; i < this.actions.length; i++) {
                await this.actions[i].run(browser, browserKind);
                await this.scanHTML(browser, browserKind);
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

    async scanHTML(browser, browserKind) {
        switch (this.browserKind) {
            case 'NIGHTMARE': 
                return this.scanHTMLWithNightmare(browser);
            case 'CHROMELESS':
                return this.scanHTMLWithChromeless(browser);
            case 'PUPPETEER':
                return this.scanHTMLWithPuppeteer(browser);
            default:
                throw `${this.browserKind} is not supported, the worker can't evaluate the HTML analysis`;
        }

    }

    async scanHTMLWithNightmare(browser) {
        let result = await browser.evaluate(htmlScan);
        return result;
    }

    async scanHTMLWithChromeless(browser) {
        let result = await browser.wait(2000).evaluate(htmlScan);
        return result;
    }

    async scanHTMLWithPuppeteer(browser) {
        let result = await browser.evaluate(htmlScan);
        return result;
    }
}

function htmlScan() {

}