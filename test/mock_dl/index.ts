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
    text?: string,
    channelId?: string,
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
        case 'carousel':
            sendActivity(res, {
                type:   "message",
                timestamp: new Date().toUTCString(),
                channelId: "webchat",
                text: "",
                attachments: [{ "contentType": "application/vnd.microsoft.card.animation", "content": { "title": "title", "subtitle": "animation", "text": "No buttons, No Image, Autoloop, Autostart, Sharable", "media": [{ "url": "http://i.imgur.com/wJTZIPB.gif", "profile": "animation"} ],"shareable": true, "autoloop": true, "autostart": true } } ],
            });
        default:
            res.send("Message receipt: " + req.body.text);             
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
