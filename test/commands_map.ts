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
    server?: (res: express.Response, sendActivity: ISendActivity, json?: JSON) => void,
    do?: (nightmare: Nightmare) => any,
    alternateText?: string,
    urlAppend?: { [paramName: string]: any }
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
            return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('hi') != -1
                //look for 3 messages - greeting, hi, and bot response
                && document.querySelectorAll('.wc-message').length === 3;
        }
    },
    "history": {
        urlAppend: {
            history: <dl.Message[]>[
                {
                    id: "-2",
                    type: 'message',
                    from: { id: 'userid', name: 'username' },
                    text: 'The user said this in the past.'
                },
                {
                    id: "-1",
                    type: 'message',
                    from: server_content.config.bot,
                    text: 'The bot said this in the past.'
                }
            ]
        },
        client: function () {
            //look for 5 messages - the 2 above, greeting, history, and bot response
            return document.querySelectorAll('.wc-message').length === 5;
        }
    },
    "options.showHeader=false": {
        urlAppend: { "formatOptions": { showHeader: false } },
        client: function () {
            var top = document.querySelector('.wc-message-groups').getClientRects()[0].top;
            return top === 0;
        }
    },
    "options.showHeader=default": {
        client: function () {
            var top = document.querySelector('.wc-message-groups').getClientRects()[0].top;
            return top > 0;
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
    "audio": {
        client: function () {
            var source = document.querySelectorAll('audio')[0].src;
            return source.indexOf("bftest.mp3") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.audio_raw);
        }
    },
    "audiocard": {
        client: function () {
            var source = document.querySelectorAll('audio')[0].src;
            return source.indexOf("bftest.mp3") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.audio_card);
        }
    },
    "button-imback": {
        client: () => new Promise((resolve) => {
            var buttons = document.querySelectorAll('button');
            var imBackBtn = buttons[1] as HTMLButtonElement;

            imBackBtn.click();
            setTimeout(() => {
                var echos = document.querySelectorAll('.format-plain');
                var lastEcho = echos.length - 1;

                var bot_echos = document.querySelectorAll('.format-markdown');
                var lastBotEcho = bot_echos.length - 1;

                resolve(echos[lastEcho].innerHTML.indexOf('imBack Button') != -1 &&
                    bot_echos[lastBotEcho].innerHTML.indexOf('echo: imBack Button') != -1);
            }, 1000);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.hero_card);
        }
    },
    "button-postback": {
        client: () => new Promise((resolve) => {
            var buttons = document.querySelectorAll('button');
            var postBackBtn = buttons[2] as HTMLButtonElement;

            postBackBtn.click();
            setTimeout(() => {
                var echos = document.querySelectorAll('.format-plain');
                var lastEcho = echos.length - 1;

                var bot_echos = document.querySelectorAll('.format-markdown');
                var lastBotEcho = bot_echos.length - 1;

                resolve(echos[lastEcho].innerHTML.indexOf('button-postback') != -1 &&
                    bot_echos[lastBotEcho].innerHTML.indexOf('echo: postBack Button') != -1);
            }, 1000);
        }),
        server: function (res, sendActivity) {
            sendActivity(res, server_content.hero_card);
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
                }, 1000);   //make sure time is longer than animation time in .wc-animate-scroll
            }, 1000);
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
    "herocard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.hero_card);
        }
    },
    "html-disabled": {
        alternateText: '<a href="http://dev.botframework.com">Bot Framework</a>',
        client: function () {
            return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('<a href=') != -1;
        }
    },
    "image": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.image_raw);
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
    "markdown-url-needs-encoding": {
        client: function () {
            var link = document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot a') as HTMLAnchorElement;
            if (!link) return false;

            //check if value is encoded
            return link.href === "https://bing.com/?q=some%20value";
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.mar_encode_card);
        }
    },
    "markdown-links-open-in-new-window": {
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
    "receiptcard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.receipt_card);
        }
    },
    "thumbnailcard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.thumbnail_card);
        }
    },
    "video": {
        client: function () {
            var source = document.querySelectorAll('video')[0].src;
            return source.indexOf("msband.mp4") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.video_raw);
        }
    },
    "videocard": {
        client: function () {
            var source = document.querySelectorAll('video')[0].src;
            return source.indexOf("msband.mp4") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.video_card);
        }
    },
    "card Weather": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return (source.indexOf("Mostly%20Cloudy-Square.png") >= 0);
        },
        server: function (res, sendActivity, json) {
            sendActivity(res, server_content.adaptive_cardsFn(json));
        }
    },
    "card BingSports": {
        client: function () {
            return (document.querySelector('.wc-adaptive-card .ac-container p').innerHTML === 'Seattle vs Panthers');
        },
        server: function (res, sendActivity, json) {
            sendActivity(res, server_content.adaptive_cardsFn(json));
        }
    },
    "card CalendarReminder": {
        client: () => new Promise((resolve) => {
            setTimeout(() => {
                var selectPullDown = document.querySelector('.wc-adaptive-card .ac-container select') as HTMLSelectElement;
                selectPullDown.selectedIndex = 3;
                resolve(selectPullDown.value === '30');
            }, 1000);
        }),
        server: function (res, sendActivity, json) {
            sendActivity(res, server_content.adaptive_cardsFn(json));
        }
    },
    "speech mic-button": {
        client: function () {
            return (document.querySelector('.wc-mic') !== null);
        }
    },
    "speech clicking-mic-starts-speaking": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000);
        },
        client: function () {
            debugger;
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Listening...'));
        }
    },
    "speech click-mic-click-to-stop": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000)
                .click('.wc-mic')
                .wait(1000);
        },
        client: function () {
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Type your message...'));
        }
    },
    "speech click-mic-type-to-stop": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000)
                .type('.wc-textbox input', '')
                .wait(2000);
        },
        client: function () {
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Type your message...'));
        }
    }
    /*
     ** Add your commands to test here **  
    "command": {
        client: function () { JavaScript evaluation syntax },
        server: function (res, sendActivity) {
            sendActivity(res, sever_content DirectLineActivity);
        }
    }
 
    ** For adaptive cards, your command will be starting with card <space> command **  
    "card command": {
        client: function () { JavaScript evaluation syntax },
        server: function (res, sendActivity) {
            server_content.adaptive_cards.attachments = [{"contentType": "application/vnd.microsoft.card.adaptive", "content": json}];
            sendActivity(res, server_content.adaptive_cards);
        }
    }
 
    ** For speech specific command, it will be starting with speech <space> command **
        "speech command": {
        client: function () { JavaScript evaluation syntax },
        server: function (res, sendActivity) {
            sendActivity(res, sever_content DirectLineActivity);
        }
    }
    */
};

//use this to run only specified tests
var testOnly = [];    //["carousel", "herocard"];

if (testOnly && testOnly.length > 0) {
    for (var key in commands_map) if (testOnly.indexOf(key) < 0) delete commands_map[key];
}

module.exports = commands_map;
