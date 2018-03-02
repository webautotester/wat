[![Build Status](https://travis-ci.org/webautotester/scenario.svg?branch=master)](https://travis-ci.org/webautotester/scenario)

JS Library to Design and Play Scraping Scenario (compliant with [Puppeteer](https://github.com/GoogleChrome/puppeteer))
=======================================================================================================================

Very simple library to create Scraping actions and scenario.

Then Scenario can be played by [Puppeteer](https://github.com/GoogleChrome/puppeteer).


Install
-------

if you want to use it:

    clone https://github.com/webautotester/scenario.git
    npm install
    npm test

Or 

    npm install wat_scenario



Action
------

The wat-action library defines a JavaScript class for Scaping actions (Goto, Type, Click, Wait, Back, ScrollTo, Check, etc.).

    const wat_action = require('wat-action');
    const gotoAction = new wat_action.GotoAction('https://duckduckgo.com');
    const typeAction = new wat_action.TypeAction('#search_form_input_homepage', 'github nightmare');
    const clickAction = new wat_action.ClickAction('#search_button_homepage');
    const waitAction = new wat_action.WaitAction('#r1-0 a.result__a');


Scenario
--------

You can also create a scenario by adding actions to it.

    const scenario = new wat_action.Scenario();
    scenario.addAction(gotoAction);
    scenario.addAction(typeAction);
    scenario.addAction(clickAction);
    scenario.addAction(waitAction);


Run Puppeteer 
--------------

By Puppeteer

    const puppeteer = require('puppeteer');	
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
	let run = await scenario.run(page, 'PUPPETEER');
    console.log(JSON.stringify(run));

