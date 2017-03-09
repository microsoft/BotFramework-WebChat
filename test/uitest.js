"use strict";
let commands = require('./commands_map');
let config = require('./mock_dl_server_config');
let Nightmare = require('nightmare');
let assert = require('assert');
let vo = require('vo');

let nightmare = Nightmare({
	show: true,
	executionTimeout: 6000
});

/*
 * 1. Run npm test in "/" 
 * 
 * 2. Executes concurrently webserver from mock_dl (index.js)
 * 
 * 3. And later mocha tests are being executed from this file. 
 * 
 * Note: if it is needed to change index.js, so index.ts must be 
 * updated and compiled. (use: npm run build-test)
 *  
*/
describe('Nightmare UI Tests', function () {
	let keys = Object.keys(commands);
	this.timeout(keys.length * 20000);

	it('evaluates each command described in commands_map.js', function (done) {
		let host = "http://localhost:" + config["port"].toString();
		let domain = host + "/mock";
		let url = host + "?domain=" +  domain;
		let results = [];

		let testAllCommands = function* () {
			for (let i = 0; i < keys.length; i++) {
				console.log("Evaluating: " + keys[i]);

				let testUrl = `${url}&t=${keys[i]}/ui`;

				//Starting server and reload the page.
				if (i == 0) {
					let result = yield nightmare.goto(testUrl);
				}

				let result = yield nightmare.goto(testUrl)
					.wait(2000)
					.type('.wc-textbox input', keys[i])
					.click('.wc-send')
					.wait(3000)
					.evaluate(commands[keys[i]].client)

				if ((keys.length - 1) == i) {
					result.end()
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
