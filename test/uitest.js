"use strict";
let commands = require('./commands');
var Nightmare = require('nightmare');
let vo = require('vo');
var assert = require('assert');
let nightmare = Nightmare({
	show: true,
	executionTimeout: 5000
});

/*
 * 1. Run webserver /public 
 * 
 * 2. Run npm test in /  (home folder)
 * npm reads package.json / scripts section
 * "test" : "mocha" execute all files from test folder
 * 
 * Defining test cases
 *  
*/
describe('Nightmare Testings', function () {
	let keys = Object.keys(commands);
	this.timeout(keys.length * 20000);

	it('evaluates every single command described in commands.js', function (done) {
		let domain = "http://localhost:3000/mock";
		let url = "http://localhost:3000?domain=" + domain;
		let results = [];

		let testAllCommands = function* () {
			for (var i = 0; i < keys.length; i++) {
				console.log("Evaluating: " + keys[i]);

				//Starting app.js and then reload the page.
				if (i == 0) {
					var result = yield nightmare.goto(url);
				}

				if ((keys.length - 1) != i) {
					var result = yield nightmare.goto(url)
						.wait(5000)
						.type('.wc-textbox input', keys[i])
						.click('.wc-send')
						.wait(4000)
						.evaluate(commands[keys[i]])
				}
				else {
					var result = yield nightmare.goto(url)
						.wait(5000)
						.type('.wc-textbox input', keys[i])
						.click('.wc-send')
						.wait(4000)
						.evaluate(commands[keys[i]])
						.end()
				}

				console.log(result);
				results.push(result);
			}
			return results;
		}

		vo(testAllCommands)(function (err, results) {
			done();
		});
	});
});
