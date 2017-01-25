require('dotenv').config();

import * as express from 'express';
import bodyParser = require('body-parser');
import * as path from 'path';

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

const timeout = 60*1000;
const conversationId = "mockversation";
const expires_in = 1800;
const streamUrl = "http://nostreamsupport";

const get_token = (req: express.Request) =>
    (req.headers["authorization"] || "works/all").split(" ")[1];

const sendExpiredToken = (res: express.Response) => {
    res.status(403).send({ error: { code: "TokenExpired" } });
} 

const sendStatus = (res: express.Response, code: string) => {
    const num = Number(code);
    if (isNaN(num))
        res.send(500).send("Mock Failed; unknown test");
    else
        res.status(num).send();
} 

app.post('/mock/tokens/generate', (req, res) => {
    const token = get_token(req);

    res.send({
        conversationId,
        token,
        expires_in 
    });
});

app.post('/mock/tokens/refresh', (req, res) => {
    const token = get_token(req);

    res.send({
        conversationId,
        token,
        expires_in 
    });
});

let counter: number;
let messageId: number;
let queue:Activity[];

app.post('/mock/conversations', (req, res) => {
    counter = 0;
    queue = [];
    messageId = 0;
    const [test, area] = get_token(req).split("/");
    if (test === 'works' || area !== 'start')
        startConversation(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => startConversation(req, res), timeout);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const startConversation = (req: express.Request, res: express.Response) => {
    const token = get_token(req);
    const [test, area] = token.split("/");

    res.send({
        conversationId,
        token,
        expires_in,
        streamUrl
    });
    sendMessage(res, `Welcome to MockBot! Here is test ${test} on area ${area}`);
}

interface Activity {
    type: string,
    timestamp?: string,
    textFormat?: string,
    text?: string,
    channelId?: string,
    attachmentLayout?: string,
    attachments?: Attachment,     
    id?: string,
    from?: { id?: string, name?: string }
}

interface Attachment{
    
}

const sendMessage = (res: express.Response, text: string) => {
    queue.push({
        type: "message",
        text
    })
}

const sendActivity = (res: express.Response, activity: Activity) => {
    queue.push(activity)
}

app.post('/mock/conversations/:conversationId/activities', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'post' || !count || ++counter < Number(count))
        postMessage(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => postMessage(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const postMessage = (req: express.Request, res: express.Response) => {
    const id = messageId++;
    res.send({
        id,
    });

    //sendMessage(res, `echo of post #${id}: ${req.body.text}`);
    processCommand(req, res, req.body.text, id);
}

const processCommand = (req: express.Request, res: express.Response, cmd: string, id: number) => {
    switch(cmd){
        case 'animation':
            sendActivity(res, {
                type:   "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                text: "",
                attachments: [{ "contentType": "application/vnd.microsoft.card.animation", "content": { "title": "title", "subtitle": "animation", "text": "No buttons, No Image, Autoloop, Autostart, Sharable", "media": [{ "url": "http://i.imgur.com/wJTZIPB.gif", "profile": "animation"} ],"shareable": true, "autoloop": true, "autostart": true } } ]
            });
            return;
        case 'carousel':
            sendActivity(res, {
                type:   "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                text: "",
                attachmentLayout: "carousel",
                attachments: [
                                {
                                "contentType": "application/vnd.microsoft.card.hero",
                                "content": {
                                    "title": "Details about image 1",
                                    "text": "Price: $XXX.XX USD",
                                    "images": [
                                    {
                                        "url": "https://compass-ssl.surface.com/assets/b7/3c/b73ccd0e-0e08-42b5-9f8d-9143223eafd0.jpg?n=Hero-panel-image-gallery_03.jpg"
                                    }
                                    ],
                                    "buttons": [
                                    {
                                        "type": "imBack",
                                        "value": "Place to buy",
                                        "title": "Places To Buy"
                                    },
                                    {
                                        "type": "imBack",
                                        "value": "Related Products",
                                        "title": "Related Products"
                                    }
                                    ]
                                }
                                },
                                {
                                "contentType": "application/vnd.microsoft.card.hero",
                                "content": {
                                    "title": "Details about image 2",
                                    "text": "Price: $XXX.XX USD",
                                    "images": [
                                    {
                                        "url": "https://compass-ssl.surface.com/assets/b5/82/b582f7f9-93ee-4ce8-971f-aacf5426decb.jpg?n=Hero-panel-image-gallery_02.jpg"
                                    }
                                    ],
                                    "buttons": [
                                    {
                                        "type": "imBack",
                                        "value": "Place to buy",
                                        "title": "Places To Buy"
                                    },
                                    {
                                        "type": "imBack",
                                        "value": "Related Products",
                                        "title": "Related Products"
                                    }
                                    ]
                                }
                                },
                                {
                                "contentType": "application/vnd.microsoft.card.hero",
                                "content": {
                                    "title": "Details about image 3",
                                    "text": "Price: $XXX.XX USD",
                                    "images": [
                                    {
                                        "url": "https://compass-ssl.surface.com/assets/9d/8f/9d8fcc7b-0b81-487a-9e2f-97d83a49666a.jpg?n=Hero-panel-image-gallery_06.jpg"
                                    }
                                    ],
                                    "buttons": [
                                    {
                                        "type": "imBack",
                                        "value": "Place to buy",
                                        "title": "Places To Buy"
                                    },
                                    {
                                        "type": "imBack",
                                        "value": "Related Products",
                                        "title": "Related Products"
                                    }
                                    ]
                                }
                                },
                                {
                                    "contentType": "application/vnd.microsoft.card.hero",
                                    "content": {
                                        "title": "Details about image 4",
                                        "text": "Price: $XXX.XX USD",
                                        "images": [
                                        {
                                            "url": "https://compass-ssl.surface.com/assets/d6/b1/d6b1b79f-db1d-44f1-98ba-b822b7744940.jpg?n=Hero-panel-image-gallery_01.jpg"
                                        }
                                        ],
                                        "buttons": [
                                        {
                                            "type": "imBack",
                                            "value": "Place to buy",
                                            "title": "Places To Buy"
                                        },
                                        {
                                            "type": "imBack",
                                            "value": "Related Products",
                                            "title": "Related Products"
                                        }
                                        ]
                                    }
                            }
                    ]
            });        
            return;
        case 'markdown':
           sendActivity(res, {
                type:   "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                textFormat: "markdown",
                text: "## Basic formatting\r\n\r\nParagraphs can be written like so. A paragraph is the \r\nbasic block of Markdown. \r\nA paragraph is what text will turn \r\ninto when there is no reason it should become anything else.\r\n\r\nParagraphs must be separated by a blank line. Basic formatting of *italics* and **bold** is supported. This *can be **nested** like* so.\r\n\r\n#### Lists\r\n\r\n### Ordered list\r\n\r\n1. one\r\n2. two\r\n3. three\r\n4. four\r\n\r\n### Unordered list\r\n\r\n* An item\r\n* Another item\r\n* Yet another item\r\n* And there's more...\r\n\r\n## Paragraph modifiers\r\n\r\n### Code block\r\n\r\n```Code blocks are very useful for developers and other \r\npeople who look at code or other things that are written \r\nin plain text. As you can see, it uses a fixed-width font.```\r\n\r\nYou can also make `inline code` to add code into other things.\r\n\r\n### Quote\r\n\r\n> Here is a quote. What this is should be self explanatory. \r\n> Quotes are automatically indented when they are used.\r\n\r\n# h1\r\n## h2\r\n### h3\r\n#### h4\r\n\r\n### Headings *can* also contain **formatting**\r\n\r\n## URLs\r\n\r\nURLs can be made in a handful of ways:\r\n\r\n* A named link to [MarkItDown][3]. The easiest way to do these is to select what you want to make a link and hit `Ctrl+L`.\r\n* Another named link to [MarkItDown](http://www.markitdown.net/)\r\n* Sometimes you just want a URL like <http://www.markitdown.net/>.\r\n\r\n## Images\r\nThis is an image\r\n\r\n![Image of Surface](https://compass-ssl.surface.com/assets/b7/3c/b73ccd0e-0e08-42b5-9f8d-9143223eafd0.jpg?n=Hero-panel-image-gallery_03.jpg)\r\n\r\n\r\n## Horizontal rule\r\n\r\nA horizontal rule is a line that goes across the middle of the page.\r\n\r\n---\r\n\r\nIt's sometimes handy for breaking things up.\r\n\r\n\r\n## Table\r\n|header1|header 2|\r\n|----|----|\r\n| cell 1 | cell 2|\r\n| cell three | cell four|\r\n\r\n"
            });
            return;            
        case 'signin':
           sendActivity(res, {
                type:   "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                attachments: [
                    {
                    "contentType": "application/vnd.microsoft.card.signin",
                    "content": {
                        "text": "Login to signin sample",
                        "buttons": [
                                {
                                    "type": "signin",
                                    "title": "Signin",
                                    "value": "https://login.live.com/login.srf?wa=wsignin1.0&ct=1464753247&rver=6.6.6556.0&wp=MBI_SSL&wreply=https:%2F%2Foutlook.live.com%2Fowa%2F&id=292841&CBCXT=out"
                                }
                            ]
                        }
                    }
                ]
            }); 
            return;    
        default:
            sendActivity(res,{
                type: "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                text: "Message receipt: " + req.body.text
            });
            return;
    }
}

app.post('/mock/conversations/:conversationId/upload', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'upload' || !count || ++counter < Number(count))
        upload(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => upload(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const upload = (req: express.Request, res: express.Response) => {
    const id = messageId++;
    res.send({
        id,
    });
}

app.get('/mock/conversations/:conversationId/activities', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'get' || !count || ++counter < Number(count))
        getMessages(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => getMessages(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

app.get('/', function (req, res) {
 res.sendFile(path.join(__dirname + "/../../samples/index.html"));
});
app.get('/botchat.js', function (req, res) {
 res.sendFile(path.join(__dirname + "/../../botchat.js"));
});
app.get('/botchat.css', function (req, res) {
 res.sendFile(path.join(__dirname + "/../../botchat.css"));
});

const getMessages = (req: express.Request, res: express.Response) => {
    if (queue.length > 0) {
        let msg = queue.shift();
        let id = messageId++;
        msg.id = id.toString();
        msg.from = { id: "id", name: "name" };
        res.send({
            activities: [msg],
            watermark: id
        });
    } else {
        res.send({
            activities: [],
            watermark: messageId
        })
    }
}

app.listen(process.env.port || process.env.PORT || 3000, () => {
    console.log('listening');
});
