import * as React from 'react';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, Conversation } from './directLineTypes';
import { startConversation, getActivities, postMessage, postFile, mimeTypes } from './directLine';
import { History } from './History'
import { Console } from './Console'

export interface ConsoleState {
    text?: string,
    enableSend?: boolean
}

interface State {
    // user ID
    userId?: string;
    // conversation metadata
    conversation?: Conversation,
    // message history
    activities?: Activity[],
    autoscroll: boolean,
    // compose window
    console?: ConsoleState
}

const guid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const outgoingMessage$ = new Subject<Message>();

const console$ = new Subject<ConsoleState>();
const consoleStart = {text: "", enableSend: true};

const incomingActivity$ = (conversation: Conversation) =>
    getActivities(conversation);

const activities$ = (conversation: Conversation, userId: string) =>
    incomingActivity$(conversation)
    .merge(outgoingMessage$)
    .scan<Activity[]>((activities, activity) => [... activities, activity], [])
    .startWith([]);

const autoscroll$ = new Subject<boolean>();

const state$ = (conversation: Conversation, userId: string) =>
    activities$(conversation, userId)
    .combineLatest(
        autoscroll$.distinctUntilChanged().startWith(true),
        console$.startWith(consoleStart),
        (activities, autoscroll, console):State => ({
            conversation: conversation,
            activities: activities,
            autoscroll: autoscroll,
            console: console
        })
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
    buttonSignIn: (text:string) => void,
    setAutoscroll: (autoscroll:boolean) => void
}

export interface ConsoleActions {
    updateMessage: (text:string) => void,
    sendMessage: () => void,
    sendFile: (files:FileList) => void
}

export class UI extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            userId: guid(),
            conversation: null,
            activities: [],
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
                    outgoingMessage$.next({
                        type: "message",
                        text: text,
                        from: {id: this.state.userId},
                        timestamp: Date.now().toString()
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

        buttonSignIn: (text:string) => {
            console.log("sign in", text);
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
                    outgoingMessage$.next({
                        type: "message",
                        text: this.state.console.text,
                        from: {id: 'user'},
                        timestamp: Date.now().toString()
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
                        const path = window.URL.createObjectURL(file);
                        outgoingMessage$.next({
                            type: "message",
                            text: this.state.console.text,
                            from: {id: 'user'},
                            timestamp: Date.now().toString(),
                            attachments: [{
                                contentType: mimeTypes[path.split('.').pop()],
                                contentUrl: path,
                                name: 'Your file here'
                            }]
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
            <History activities={ this.state.activities } autoscroll={ this.state.autoscroll } actions={ this.historyActions } userId={ this.state.userId }/>
            <Console actions={ this.consoleActions } { ...this.state.console } />
        </div>;
    }
}
