import * as server_content from './server_content';
import * as dl from "../node_modules/botframework-directlinejs/built/directLine";
import * as Nightmare from 'nightmare';
import * as express from 'express';
declare let module: any;

interface ISendActivity {
    (res: express.Response, activity: dl.Message): void;
}

interface CommandValues {
    client: () => (boolean | Promise<boolean>),
    server?: (res: express.Response, sendActivity: ISendActivity) => void,
    do?: (nightmare: Nightmare) => any
}

interface CommandValuesMap {
    [key: string]: CommandValues
}

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
var commands_map: CommandValuesMap = {
    "hi": {
        client: function () {
            return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('hi') != -1;
        }
    },
    "animation": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface_anim.gif") >= 0;
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
    "carousel-to-right": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;

            // Carousel made of 4 cards.
            // 3-Clicks are needed to move all carousel to right.
            // Note: Electron browser width size must not be changed.             
            right_arrow.click();
            setTimeout(() => {
                right_arrow.click();
                setTimeout(() => {
                    right_arrow.click();
                    setTimeout(() => {
                        resolve(right_arrow.getAttribute('disabled') != null);
                    }, 2000);
                }, 500);
            }, 500);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.car_card);
        }
    },
    "carousel-to-left": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next:not([disabled])')[0] as HTMLButtonElement;
            // One-Click to the right
            right_arrow.click();
            setTimeout(() => {
                // One-click to the left
                var left_arrow = document.querySelectorAll(".scroll.previous")[0] as HTMLButtonElement;
                left_arrow.click();
                setTimeout(() => {
                    resolve(left_arrow.getAttribute('disabled') != null);
                }, 800);
            }, 500);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.car_card);
        }
    },
    "carousel-fit-width": {
        client: function () {
            var left_arrow = document.querySelectorAll(".scroll.previous")[0] as HTMLButtonElement;
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;
            return left_arrow.getAttribute('disabled') != null && right_arrow.getAttribute('disabled') != null;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.smallcar_card);
        }
    },
    "carousel-scroll": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;

            // Scrolling the carousel simulating touch action
            var car_items = document.querySelectorAll('.wc-carousel-item').length;
            for (var i = 0; i < car_items; i++) {
                var element = document.querySelectorAll('.wc-carousel-item')[i];
                element.scrollIntoView();
            }
            setTimeout(() => {
                resolve(right_arrow.getAttribute('disabled') != null);
            }, 500);
        }),
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
    "markdown-link": {
        do: function (nightmare) {
            nightmare.click('a')
                .wait(4000)
        },
        client: function () {
            return window.location.href.indexOf("localhost") !== -1;
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
    "suggested-actions": {
        client: function () {
            var ul_object = document.querySelectorAll('ul')[0];
            var show_actions_length = document.querySelectorAll('.show-actions').length;

            // Validating if the the 3 buttons are displayed and suggested actions are visibile  
            return ul_object.childNodes[0].textContent == "Blue" &&
                ul_object.childNodes[1].textContent == "Red" &&
                ul_object.childNodes[2].textContent == "Green" &&
                show_actions_length == 1;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.suggested_actions_card);
        }
    },
    "suggested-actions-away": {
        client: () => new Promise((resolve) => {
            var green_button = document.querySelectorAll('button[title="Green"]')[0] as HTMLButtonElement;
            green_button.click();
            setTimeout(() => {
                var show_actions_length = document.querySelectorAll('.show-actions').length;
                resolve(show_actions_length == 0);
            }, 2000);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.suggested_actions_card);
        }
    },
    "suggested-actions-click": {
        client: () => new Promise((resolve) => {
            var red_button = document.querySelectorAll('button[title="Red"]')[0] as HTMLButtonElement;
            red_button.click();
            setTimeout(() => {
                // Waiting more time
                setTimeout(() => {
                    // Getting for bot response
                    var response_text = document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('Red') != -1;
                    resolve(response_text);
                }, 2000);
            }, 2000);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.suggested_actions_card);
        }
    },
    /*
     ** Add your commands to test here **  
    "command": {
        client: function () { JavaScript evaluation syntax },
        server: function (res, sendActivity) {
            sendActivity(res, sever_content DirectLineActivity);
        }
    }
    */
    "end": {
        client: function () { return true; }
    }
};

module.exports = commands_map;