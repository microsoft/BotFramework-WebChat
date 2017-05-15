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

Nightmare.prototype.do = function(doFn){
	if(doFn) {
		doFn(this);
	}
	return this;
}

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

		let isTrueColor = "\x1b[32m";
		let isFalseColor = "\x1b[31m";
		let deviceColor = "\x1b[36m%s\x1b[0m";
		let resultToConsole = function (result) {
			result ? console.log(isTrueColor, `${tab}${tab}${result}`) :
				console.log(isFalseColor, `${tab}${tab}${result}`);
		}
		let deviceToConsole = function(device, width){
				console.log(deviceColor, `${tab}${device} (width: ${width}px)`);
		}

		//Testing devices and commands 
		let testAllCommands = function* () {
			for (let device in devices) {
				let width = devices[device];
				deviceToConsole(device, width);

				for (let cmd_index = 0; cmd_index < keys.length; cmd_index++) {
					console.log(`${tab}${tab}Command: ${keys[cmd_index]}`);

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
						.do(commands[keys[cmd_index]].do)
						.evaluate(commands[keys[cmd_index]].client)

					resultToConsole(result);
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