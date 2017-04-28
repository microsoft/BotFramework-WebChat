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

describe('nightmare UI tests', function () {
	let devices = config["width-tests"];
	let keys = Object.keys(commands);
	this.timeout(devices.length * keys.length * 20000);

	it('Evaluates all UI width_tests for all commands_map file', function (done) {
		let host = "http://localhost:" + config["port"].toString();
		let domain = host + "/mock";
		let url = host + "?domain=" + domain;
		let tab = "\t";
		let results = [];

		let testAllCommands = function* () {
			for (let device in devices) {
				let width = devices[device];
				console.log('\x1b[36m%s\x1b[0m', tab + device + " (width: " + width + "px)");

				for (let cmd_index = 0; cmd_index < keys.length; cmd_index++) {
					console.log(tab + tab + "Command: " + keys[cmd_index]);

					let testUrl = `${url}&t=${keys[cmd_index]}/ui`;
					let result = "";

					//Starting server and reload the page.
					if (cmd_index == 0) {
						result = yield nightmare.goto(testUrl)
							.viewport(width, 768);
					}

					result = yield nightmare.goto(testUrl)
						.viewport(width, 768)
						.wait(2000)
						.type('.wc-textbox input', keys[cmd_index])
						.click('.wc-send')
						.wait(3000)
						.evaluate(commands[keys[cmd_index]].client)

					result ? console.log("\x1b[32m", tab + tab + result) : console.log("\x1b[31m", tab + tab + result);
					results.push(result);
				}
			}
			yield nightmare.end();
			return results;
		}

		vo(testAllCommands)(function (err, results) {
			done();
		});
	});
});