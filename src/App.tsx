import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { BotMessage, BotConversation } from './directLineTypes';
import { domain, startConversation, getMessages, postMessage, postFile } from './directLine';
import { History } from './History.tsx'
import { Console } from './Console.tsx'

export interface Message {
    from: "me" | "bot",
    text?: string,
    images?: string[],
    timestamp: number
} 

export interface ConsoleState {
    text?: string,
    enableSend?: boolean
}

interface State {
    // user ID
    userId?: string;
    // conversation metadata
    conversation?: BotConversation,
    // message history
    messages?: Message[],
    // compose window
    console?: ConsoleState
}

const guid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const outgoing$ = new Subject<Message>();

const console$ = new Subject<ConsoleState>();
const consoleStart = {text: "", enableSend: true};

const incoming$ = (conversation) =>
    getMessages(conversation)
    .filter(botmessage => botmessage.from === "TestBotV3");

const message$ = (conversation) =>
    incoming$(conversation)
    .map<Message>(botmessage => ({
        text: botmessage.text,
        images: botmessage.images.map(path => domain + path),
        from: "bot",
        timestamp: Date.parse(botmessage.created)
    }))
    .merge(outgoing$)
    .scan<Message[]>((messages, message) => [...messages, message], []);

const state$ = (conversation) => 
    message$(conversation).startWith([])
    .combineLatest(
        console$.startWith(consoleStart),
        (messages, compose) => ({
            conversation: conversation,
            messages: messages,
            console: compose
        } as State)
    )
    .do(state => console.log("state", state));

const conversation$ = startConversation;

const getQueryParams = () => {
    const params = {};
    location.search.
        substring(1).
        split("&").
        forEach(pair => {
            const p = pair.split("=");
            params[p[0]] = p[1];
        });
    return params;
}

class App extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            userId: guid(),
            conversation: null,
            messages: [],
            console: consoleStart
        }

        const queryParams = getQueryParams();
        const appSecret = queryParams['s'];

        conversation$(appSecret)
        .flatMap(conversation => state$(conversation))
        .subscribe(
            state => this.setState(state),
            error => console.log("errors", error)
        );
    }

    private consoleActions = {
        updateMessage: (text: string) => {
            console$.next({text: text, enableSend: this.state.console.enableSend});
        },

        sendMessage: () => {
            console$.next({text: this.state.console.text, enableSend: false});
            postMessage(this.state.console.text, this.state.conversation, this.state.userId)
            .retry(2)
            .subscribe(
                () => {
                    outgoing$.next({
                        text: this.state.console.text,
                        from: "me",
                        timestamp: Date.now()
                    });
                    console$.next({
                        text: "",
                        enableSend: true
                    });
                },
                error => {
                    console.log("failed to post message");
                    console$.next({text: this.state.console.text, enableSend: true});
                }
            );
        },

        sendFile: (files:FileList) => {
            for (let i = 0, numFiles = files.length; i < numFiles; i++) {
                const file = files[i];
                postFile(file, this.state.conversation)
                .retry(2)
                .subscribe(
                    () => {
                        outgoing$.next({
                            images: [window.URL.createObjectURL(file)],
                            from: "me",
                            timestamp: Date.now()
                        });
                    },
                    error => {
                        console.log("failed to post file");
                    }
                )
            }
        }
    }

    render() {
        return <div id="appFrame">
            <History messages={ this.state.messages }/> 
            <Console actions={ this.consoleActions } { ...this.state.console } />
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
