import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { BotMessage, BotConversation } from './directLineTypes';
import { startConversation, getMessages, postMessage, postFile, imageURL } from './directLine';
import { History } from './History.tsx'
import { Console } from './Console.tsx'

export interface Message extends BotMessage {
    fromBot: boolean,
    timestamp: number
} 

export interface MessageGroup {
    messages: Message[],
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
    messagegroups?: MessageGroup[],
    autoscroll: boolean,
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

const incoming$ = (conversation: BotConversation, userId: string) =>
    getMessages(conversation)
    .filter(botmessage => botmessage.from != userId);

const messagegroup$ = (conversation: BotConversation, userId: string) =>
    incoming$(conversation, userId)
    .map<Message>(botmessage => Object.assign({}, botmessage, {
            images: botmessage.images.map(path => imageURL(path)),
            fromBot: true,
            timestamp: Date.parse(botmessage.created)
        }) as Message)
    .merge(outgoing$)
    .scan<MessageGroup[]>((messagegroups, message) => {
        let ms: Message[];
        let mgs: MessageGroup[];
        if (messagegroups.length === 0) {
            ms = [message];
            mgs = [];
        } else {
            const latest = messagegroups[messagegroups.length - 1];        
            if (message.timestamp - latest.timestamp < 60 * 1000) {
                ms = latest.messages.slice();
                ms.push(message);
                mgs = messagegroups.slice(0, messagegroups.length - 1);
            } else {
                ms = [message];
                mgs = messagegroups.slice();
            }
        }
        mgs.push({ messages: ms, timestamp: message.timestamp });
        return mgs;
    }, []);

const autoscroll$ = new Subject<boolean>();

const state$ = (conversation: BotConversation, userId: string) => 
    messagegroup$(conversation, userId).startWith([])
    .combineLatest(
        autoscroll$.distinctUntilChanged().startWith(true),
        console$.startWith(consoleStart),
        (messagegroups, autoscroll, console) => ({
            conversation: conversation,
            messagegroups: messagegroups,
            autoscroll: autoscroll,
            console: console
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

export interface HistoryActions {
    buttonImBack: (text:string) => void,
    buttonOpenUrl: (text:string) => void,
    buttonPostBack: (text:string) => void,
    setAutoscroll: (autoscroll:boolean) => void
}

export interface ConsoleActions {
    updateMessage: (text:string) => void,
    sendMessage: () => void,
    sendFile: (files:FileList) => void
}

class App extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            userId: guid(),
            conversation: null,
            messagegroups: [],
            autoscroll: true,
            console: consoleStart
        }

        const queryParams = getQueryParams();
        const appSecret = queryParams['s'];

        conversation$(appSecret)
        .flatMap(conversation => state$(conversation, this.state.userId))
        .subscribe(
            state => this.setState(state),
            error => console.log("errors", error)
        );
    }

    private historyActions: HistoryActions = {
        buttonImBack: (text:string) => {
            postMessage(text, this.state.conversation, this.state.userId)
            .retry(2)
            .subscribe(
                () => {
                    outgoing$.next({
                        fromBot: false,
                        timestamp: Date.now()
                    });
                },
                error => {
                    console.log("failed to post message");
                }
            );
        },

        buttonOpenUrl: (text:string) => {
            console.log("open URL", text);
        },

        buttonPostBack: (text:string) => {
            postMessage(text, this.state.conversation, this.state.userId)
            .retry(2)
            .subscribe(
                () => {
                    console.log("quietly posted message to bot", text);
                },
                error => {
                    console.log("failed to post message");
                }
            );
        },

        setAutoscroll: (autoscroll:boolean) => {
            autoscroll$.next(autoscroll);
        }
    }

    private consoleActions: ConsoleActions = {
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
                        fromBot: false,
                        timestamp: Date.now()
                    });
                    console$.next({
                        text: "",
                        enableSend: true
                    });
                    autoscroll$.next(true);
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
                            fromBot: false,
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
        return <div className="wc-app">
            <div className="wc-header">
                WebChat
            </div>
            <History messagegroups={ this.state.messagegroups } autoscroll={ this.state.autoscroll } actions={ this.historyActions }/> 
            <Console actions={ this.consoleActions } { ...this.state.console } />
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
