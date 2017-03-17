import * as server_content from './server_content';
import * as dl from "../node_modules/botframework-directlinejs/built/directLine";
import * as express from 'express';
declare let module: any;

interface ISendActivity {
    (res: express.Response, activity: dl.Message): void;
}

interface CommandValues {
    client: () => void,
    server?: (res: express.Response, sendActivity: ISendActivity) => void
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
            return document.querySelectorAll('span.format-markdown')[2].innerHTML.indexOf('hi') != -1;
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
        client: async function () {

            async function rightArrowClick(){
                right_arrow.click();
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });
            }

            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;
            
            // Carousel made of 4 cards.
            // 2-Clicks are needed to move all carousel to right.
            // Note: Electron browser width size must not be changed. 
            await rightArrowClick();
            await rightArrowClick();

            // Validates if the right_arrow button is disabled.             
            return right_arrow.getAttribute('disabled') != null;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.car_card);
        }
    },
    "carousel-to-left": {
        client: async function () {
            // One-Click to the right
            var right_arrow = document.querySelectorAll('.scroll.next:not([disabled])')[0] as HTMLButtonElement;
            right_arrow.click();
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
            
            // One-click to the left
            var left_arrow = document.querySelectorAll(".scroll.previous")[0] as HTMLButtonElement;
            left_arrow.click();
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            
            return left_arrow.getAttribute('disabled') != null;
        },
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
        client: async function () {
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;
            
            // Scrolling the carousel simulating touch action
            var car_items = document.querySelectorAll('.wc-carousel-item').length;
            for(var i=0; i<car_items; i++){
                var element = document.querySelectorAll('.wc-carousel-item')[i];
                element.scrollIntoView();
                await new Promise((resolve) => {
                    setTimeout(resolve, 300);
                }); 
            }

            return right_arrow.getAttribute('disabled') != null;
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
    "suggested-actions":{
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
    "suggested-actions-away":{
        client: async function () {
            var green_button = document.querySelectorAll('button[title="Green"]')[0] as HTMLButtonElement;
            green_button.click();
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });

            // Validating suggested actions went away
            var show_actions_length = document.querySelectorAll('.show-actions').length;
            return show_actions_length == 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.suggested_actions_card);
        }        
    },
    "suggested-actions-click":{
        client: async function () {
            var red_button = document.querySelectorAll('button[title="Red"]')[0] as HTMLButtonElement;
            red_button.click();
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
            
            // Getting response from bot
            var response_text = document.querySelectorAll('span[class="format-markdown"]')[3].childNodes[0].childNodes[0].textContent;
            return response_text == "echo: Red";
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.suggested_actions_card);
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