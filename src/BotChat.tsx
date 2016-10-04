import * as React from 'react';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, Conversation } from './directLineTypes';
import { startConversation, getActivities, postMessage, postFile, mimeTypes } from './directLine';
import { History } from './History';
import { Console } from './Console';
import { DebugView } from './DebugView';

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
    // State of the DebugView control
    debugViewState?: DebugViewState,
    // Currently selected activity
    selectedActivity?: Activity,
    // compose window
    console?: ConsoleState
}

// Visibility state of the DebugView panel
export enum DebugViewState {
    disabled,
    enabled,
    visible
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
const debugViewState$ = new Subject<DebugViewState>();
const selectedActivity$ = new Subject<Activity>();

const state$ = (conversation: Conversation, userId: string, debugViewState: DebugViewState) =>
    activities$(conversation, userId)
    .combineLatest(
        autoscroll$.distinctUntilChanged().startWith(true),
        debugViewState$.distinctUntilChanged().startWith(debugViewState),
        selectedActivity$.distinctUntilChanged().startWith(undefined),
        console$.startWith(consoleStart),
        (activities, autoscroll, debugViewState, selectedActivity, console):State => ({
            conversation,
            activities,
            autoscroll,
            debugViewState,
            selectedActivity,
            console
        })
    )
    .do(state => console.log("state", state));

const conversation$ = startConversation;

export interface HistoryActions {
    buttonImBack: (text:string) => void,
    buttonOpenUrl: (text:string) => void,
    buttonPostBack: (text:string) => void,
    buttonSignIn: (text:string) => void,
    setAutoscroll: (autoscroll:boolean) => void,
    onMessageClicked: (message: Activity, e: React.SyntheticEvent<any>) => void
}

export interface ConsoleActions {
    updateMessage: (text:string) => void,
    sendMessage: () => void,
    sendFile: (files:FileList) => void
}

interface Props {
    appSecret: string,
    debug: string
}

export class UI extends React.Component<Props, State> {
    constructor() {
        super();
        this.state = {
            userId: guid(),
            conversation: null,
            activities: [],
            autoscroll: true,
            console: consoleStart
        }
    }

    componentWillMount() {
        const debug = this.props.debug && this.props.debug.toLowerCase();
        let debugViewState = DebugViewState.disabled;
        if (debug === DebugViewState[DebugViewState.enabled])
            debugViewState = DebugViewState.enabled;
        else if (debug === DebugViewState[DebugViewState.visible])
            debugViewState = DebugViewState.visible;

        conversation$(this.props.appSecret)
        .flatMap(conversation => state$(conversation, this.state.userId, debugViewState))
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
        },

        onMessageClicked: (message: Activity, e: React.SyntheticEvent<any>) => {
            selectedActivity$.next(message);
            e.preventDefault();
            e.stopPropagation();
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
                        from: {id: this.state.userId},
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
                            from: {id: this.state.userId},
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

    toggleDebugView() {
        let newState;
        if (this.isDebuggerVisible()) {
            newState = DebugViewState.enabled;
        } else if (this.isDebuggerEnabled()) {
            newState = DebugViewState.visible;
        } else {
            newState = DebugViewState.disabled;
        }
        if (newState !== DebugViewState.visible) {
            selectedActivity$.next(null);
        }
        debugViewState$.next(newState);
    }

    isDebuggerVisible() {
        return this.state.debugViewState === DebugViewState.visible;
    }

    isDebuggerEnabled() {
        return this.state.debugViewState !== DebugViewState.disabled;
    }

    render() {
        return (
            <div className="wc-app">
                <div className={ "wc-chatview-panel" + (this.isDebuggerVisible() ? " wc-withdebugview" : "") }>
                    <div className="wc-header">
                        <span>WebChat</span>
                        <div className={ "wc-toggledebugview" + (this.isDebuggerEnabled() ? "" : " wc-hidden") } onClick={ () => this.toggleDebugView() }>
                            <svg width="20" height="20" viewBox="0 0 1792 1792">
                                <rect id="panel" height="1152.159352" width="642.020858" y="384.053042" x="959.042634" />
                                <path id="frame" d="m224,1536l608,0l0,-1152l-640,0l0,1120q0,13 9.5,22.5t22.5,9.5zm1376,-32l0,-1120l-640,0l0,1152l608,0q13,0 22.5,-9.5t9.5,-22.5zm128,-1216l0,1216q0,66 -47,113t-113,47l-1344,0q-66,0 -113,-47t-47,-113l0,-1216q0,-66 47,-113t113,-47l1344,0q66,0 113,47t47,113z" />
                            </svg>
                        </div>
                    </div>
                    <History
                        activities={ this.state.activities }
                        autoscroll={ this.state.autoscroll }
                        actions={ this.historyActions }
                        userId={ this.state.userId }
                        selectedActivity={ this.state.selectedActivity }
                        debuggerVisible={ this.isDebuggerVisible() } />
                    <Console actions={ this.consoleActions } { ...this.state.console } />
                </div>
                <div className={ "wc-debugview-panel" + (this.isDebuggerVisible() ? "" : " wc-hidden") }>
                    <div className="wc-header">
                        <span>Debug</span>
                    </div>
                    <DebugView activity={ this.state.selectedActivity } />
                </div>
            </div>
        );
    }
}
