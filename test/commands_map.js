"use strict";
var server_content = require("./server_content");
/*
 * 1. Add command following CommandValues interface
 *
 * 2. Create a DirectLineActivity in server_content.ts
 *
 * 3. Import variable to this file and use it as param.
 *
 * Note: if it is needed to change index.js, so index.ts must be
 * updated and compiled. (use: npm run build-test)
 *
*/
var commands_map = {
    "hi": {
        client: function () {
            return document.querySelectorAll('span.format-markdown')[2].innerHTML.indexOf('hi') != -1;
        }
    },
    "animation": {
        client: function () {
            return document.querySelectorAll('img')[0].src == "http://i.imgur.com/wJTZIPB.gif";
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.ani_card);
        }
    },
    "carousel": {
        client: function () {
            return document.querySelectorAll('.scroll.next').length > 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.car_card);
        }
    },
    "markdown": {
        client: function () {
            return document.querySelectorAll('h3').length > 5;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.mar_card);
        }
    },
    "signin": {
        client: function () {
            return document.querySelectorAll('button')[0].textContent == "Signin";
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.si_card);
        }
    },
    /*
    * Add your commands to test here
    "command": {
        client: function () { JavaScript evaluation syntax },
        server: function (res, sendActivity) {
            sendActivity(res, sever_content DirectLineActivity);
        }
    }*/
    "end": {
        client: function () { return true; }
    }
};
module.exports = commands_map;
