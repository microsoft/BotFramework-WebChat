# Automation test framework for Web Chat by using Direct Line API

> ## Disclaimer: The target audience for this document is towards to Web Chat and Direct Line API contributors. Although Direct Line API is underneath the Bot Framework, but to test bots locally, please use the [Microsoft Bot Emulator](https://github.com/Microsoft/BotFramework-Emulator) instead.

## Overview of the test framework ecosystem

The test framework is comprised of two major components in the implementation:

* A Web Chat channel hosting bot application.
* A mock service and client objects which communicates with bot through the Web Chat channel via __DirectLine API__.

<pre>
[ Web Chat (test.html) ]                             [ Mock Service ]
┌───────────────┐         ┌─────────────┐            ┌─────────────────────┐
│  Electron App │   <---  │ Direct Line │   <---     │ mock_dl\index.ts    │
├───────────────┤   --->  │     API     │   --->     ├─────────────────────┤
│               │         └─────────────┘            │ commands_map.ts     │
│     Bot       │                                    │┌───────────────────┐│
│  interactive  │               Direct Line.ts --->  ││ .server           ││
│     area      │                                    ││ server_content.ts ││
│               │         ┌─────────────┐            │├───────────────────┤│
├───────────────┤         │ Mocha tests │    <---    ││ .client           ││
│ Chat inputbox │  <--->  │ uitest.js   │            │└───────────────────┘│
└───────────────┘         └─────────────┘            └─────────────────────┘
</pre>

The workflow of the mock service spins up __Web Chat__ with __Direct Line API__.  While mock service side-loads __commands_map.server__ object which will overwrite the default __Direct Line API__ behaviors with current implement.

Meanwhile, __uitest.js__ will run [Nightmare.js](http://www.Nightmare.js.org/) with [Mocha.js](https://mochajs.org/) tests in __commands_map.client__ instead.

## Understand the npm scripts

There are some __npm__ commands to help setup test environment quickly (from the root directory). 

### Run everything magically

1) Use __"npm run build-test"__ to build the test framework. __"npm run build-test"__ command will compile [TypeScript](http://www.typescriptlang.org) in both /test and /test/mock_dl folders.

    > To build on every file changes, please use __"npm run build-test-watch"__ instead.

2) Use __"npm test"__ or __"npm run test"__ to start a mock server (Direct Line Service) which bridges communications between the Web Chat application in [Mocha.js](https://mochajs.org/) tests on the [Nightmare.js](http://www.Nightmare.js.org/) test framework.

### How to run mock service and Nightmare test framework separately

* When it comes to run mock service and tests separately, __"node test/mock_dl/index.js\\"__ will run the mock server on default port of 3000.
* While running the mock service as a standalone service. It is possible to interact with Web Chat client UI manually by browsing to [http://localhost:3000/?domain=http://localhost:3000/mock](http://localhost:3000/?domain=http://localhost:3000/mock) with a web browser. For example, type in __"animation"__ to into the input box, Web Chat bot returns an [AnimationCard](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.animationcard.html).
* After the mock service is properly running, automates [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) tests with __"./node_modules/.bin/mocha test"__ command.

### Notes to keep in mind

> * Always __"npm run build-test"__ to build test framework prior any testing processes.
> * Keep in mind that if mock server and [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) tests are both running separately, the mock server will occupied one terminal (process), tests will run from another terminal (process). If mock server is interrupted, closed, killed, or force closed, the tests will fail intermediately.
> * Although __"npm run build-test-watch"__ will monitor file-system changes to perform automatic rebuilds, but watch system will also occupied a process thread on its own.
> * While running [Nightmare.js](http://www.Nightmare.js.org/), press Ctrl + C a couple of times to cancel it at any time during the process.

## Quick hands-on example

### How to write a simple "Hello World" test?

Easiest way is to look through examples from repo and find the proper mock data object to overwrite. They should be in the __server_content.ts__ & __commands_map.ts__ these two files.

First, change __server_content.ts__ to hard code a response when bot sees "hello world" in the chatting conversation.

```Javascript
export var hello_world: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "Hello Bot World"
}
```

Meanwhile in the __commands_map.ts__ world :

```Javascript
// "hello world" would be the phrase expected by user input. It will map to the proper server_content.

"hello world": {
    client: function () {
        // UI TEST : looking for bot returns "Hello Bot World" in the message, and verify the action.
        return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('Hello Bot World') != -1;
    },
    server: function (res, sendActivity) {
        // tells mock server to trigger the "hello_world: dl.Message"
        sendActivity(res, server_content.hello_world);
    }
},
```

At this point, save your changes, run __npm run build-test__ then __npm_test__ everything should be working as expected. If mock server was running separately, manually type in "hello world" in the Web Chat input box. The bot in the Web Chat will surely returns "Hello Bot World" as a reply.

---

## Other useful implementation details

In the __BotFramework-WebChat__ repo, key component files inside of the /test folders are:

> ### /test/Mock_dl/index.ts

This file will be the mock service itself runs on [Node.js](https://nodejs.org/). It will load __commands_map__ object into itself to communicate through the __Direct Line API__ to the __Web Chat__ instance.

The mock server default port is 3000. To resolve a port conflict, change listening port from __/test/mock_dl_server_config.js__.

```Javascript
module.exports = {
    "port": 3000,
    ....
}
```

This mock server will take commands from __/test/commands_map.js__ as UI test commands. (Please referring to __comands_map.ts__ for more information).

> ### commands_map.ts

The __commands_map__ file contains the __commands_map__ object. This object is responsible for both communication to the mock server and  [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) UI tests.

```Javascript
    "animation": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface_anim.gif") >= 0;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.ani_card);
        }
    },
```

1) __uitest.js__ will be running at same time when mock service is running.  Within the __testAllCommands()__ of the __uitest.js__, it will trigger each hash key in __commands_map__. (Inclouding this example; __"animation"__).
2) __testAllCommands()__ will then trigger the __sendActivity()__ method by passing in __server_content.ani_card__ object.

```Javascript
var bot: dl.User = {
    id: "bot",
    name: "botname"
}

export var ani_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.AnimationCard>{
            contentType: "application/vnd.microsoft.card.animation",
            content: {
                title: "title",
                subtitle: "animation",
                text: "No buttons, No Image, Autoloop, Autostart, Sharable",
                media: [{ url: asset_url + "surface_anim.gif", profile: "animation" }],
                autoloop: true,
                autostart: true
            }
        }
    ]
}
```

3) The __ani_card__ object contents required properties when communicates through __Direct Line API__.
4) The actual __Direct Line API__ overwrites comes from __dl.AnimationCard__ object as mock data. We then wrap this mock data response in __dl.Message__ triggers __Direct Line API__ to send a Message.

> ### server_content.ts

The __server_content.ts__ file contains [Rich Cards](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards) models overwrites as mock data. Module structure has to match __/node-modules/botframework-Direct Linejs/src/Direct Line.ts__

> ### test.html

The __test.html__ is the HTML presentation of the Web Chat. Loading a Web Chat client is simply as following:

```Javascript
<link href="botchat.css" rel="stylesheet" />
<link href="botchat-fullwindow.css" rel="stylesheet" />
<script src="botchat.js"></script>
```

> ### mock_dl_server_config.js

In the __mock_dl_server_config.js__ lies configurations for UI tests. The __width_tests__ object will determine the width of [Electron](https://github.com/electron/electron) during testing.

```Javascript
// mock_dl_server_config.js
var width_tests = {
    "iphone5": 320,
    "iphone6": 375,
    "iphone6-plus": 414,
    "ipad": 768,
    "desktop": 1024
};

module.exports = {
    "port": 3000,
    "width-tests": width_tests
};
```

> ### uitest.js

This __uitest.js__ file, is the core of the [Mocha.js](https://mochajs.org/) tests runs with [Nightmare.js](http://www.Nightmare.js.org/) hookup, but binds with [vo](https://github.com/matthewmueller/vo) (flow library) to batch testing every screen size in __width_tests__


---

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
