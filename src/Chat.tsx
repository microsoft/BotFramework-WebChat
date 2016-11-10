import * as React from 'react';
import { Subscription } from '@reactivex/rxjs';
import { Activity, Message, IBotConnection, User, MediaType } from './BotConnection';
import { DirectLine } from './directLine';
//import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
import { strings } from './Strings';
import { Unsubscribe } from 'redux';

export interface ActivityState {
    status: "received" | "sending" | "sent" | "retry",
    sendId?: number
};

export interface FormatOptions {
    showHeader?: boolean
}

export interface ChatProps {
    user: User,
    botConnection: IBotConnection,
    locale?: string,
    onActivitySelected?: (activity: Activity) => void,
    formatOptions?: FormatOptions
}

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();
    private storeUnsubscribe: Unsubscribe;
    private activitySubscription: Subscription;
    private connectedSubscription: Subscription;
    private typingTimers = {};

    constructor(props) {
        super(props);

        console.log("BotChat.Chat props", props);

        this.store.dispatch({ type: 'Start_Connection', user: props.user, botConnection: props.botConnection } as ConnectionAction);

        if (props.formatOptions)
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions } as FormatAction);

        this.store.dispatch({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) } as FormatAction);

        props.botConnection.start();
        this.connectedSubscription = props.botConnection.connected$.filter(connected => connected === true).subscribe(connected => {
            this.store.dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
        });
        this.activitySubscription = props.botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => console.log("errors", error)
        );
    }

    handleIncomingActivity(activity: Activity) {
        let state = this.store.getState();
        switch (activity.type) {

            case "message":
                if (activity.from.id === state.connection.user.id)
                    break;

                // 'typing' activity only available with WebSockets, so this allows us to test with polling GET 
                if (activity.text && activity.text.endsWith("//typing"))
                    activity = Object.assign({}, activity, { type: 'typing' });
                else {
                    if (!state.history.activities.find(a => a.id === activity.id)) // don't allow duplicate messages
                        this.store.dispatch({ type: 'Receive_Message', activity } as HistoryAction);
                    break;
                }

            case "typing":
                if (this.typingTimers[activity.from.id]) {
                    clearTimeout(this.typingTimers[activity.from.id]);
                    this.typingTimers[activity.from.id] = undefined;
                }
                this.store.dispatch({ type: 'Show_Typing', activity } as HistoryAction);
                this.typingTimers[activity.from.id] = setTimeout(() => {
                    this.typingTimers[activity.from.id] = undefined;
                    this.store.dispatch({ type: 'Clear_Typing', from: activity.from } as HistoryAction);
                }, 3000);
                break;
        }
    }

    componentDidMount() {
        this.storeUnsubscribe = this.store.subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.activitySubscription.unsubscribe();
        this.connectedSubscription.unsubscribe();
        this.props.botConnection.end();
        this.storeUnsubscribe();
        for (let key in this.typingTimers) {
            clearTimeout(this.typingTimers[key])
        }
    }

    render() {
        const state = this.store.getState();
        console.log("BotChat.Chat state", state);
        let header;
        if (state.format.options.showHeader) header =
            <div className="wc-header">
                <span>{ state.format.strings.title }</span>
            </div>;

        return (
            <div className={ "wc-chatview-panel" }>
                { header }
                <History store={ this.store } onActivitySelected={ this.props.onActivitySelected } />
                <Shell store={ this.store } />
            </div>
        );
    }
}

export const sendMessage = (store: ChatStore, text: string) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0)
        return;
    let state = store.getState();
    const sendId = state.history.sendCounter;
    store.dispatch({ type: 'Send_Message', activity: {
        type: "message",
        text,
        from: state.connection.user,
        timestamp: (new Date()).toISOString()
    }} as HistoryAction);
    trySendMessage(store, sendId);
}

export const trySendMessage = (store: ChatStore, sendId: number, updateStatus = false) => {
    if (updateStatus) {
        store.dispatch({ type: "Send_Message_Try", sendId } as HistoryAction);
    }
    let state = store.getState();
    const activity = state.history.activities.find(activity => activity["sendId"] === sendId);
    state.connection.botConnection.postMessage((activity as Message).text, state.connection.user)
    .subscribe(id => {
        console.log("success sending message", id);
        store.dispatch({ type: "Send_Message_Succeed", sendId, id } as HistoryAction);
    }, error => {
        console.log("failed to send message", error);
        // TODO: show an error under the message with "retry" link
        store.dispatch({ type: "Send_Message_Fail", sendId } as HistoryAction);
    });
}

export const sendPostBack = (store: ChatStore, text: string) => {
    const state = store.getState();
    state.connection.botConnection.postMessage(text, state.connection.user)
        .subscribe(id => {
            console.log("success sending postBack", id)
        }, error => {
            console.log("failed to send postBack", error);
        });
}

export const sendFiles = (store: ChatStore, files: FileList) => {
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        console.log("file", file);
        let state = store.getState();
        const sendId = state.history.sendCounter;
        store.dispatch({ type: 'Send_Message', activity: {
            type: "message",
            from: state.connection.user,
            timestamp: (new Date()).toISOString(),
            attachments: [{
                contentType: file.type as MediaType,
                contentUrl: window.URL.createObjectURL(file),
                name: file.name
            }]
        }} as HistoryAction);
        state = store.getState();
        state.connection.botConnection.postFile(file, state.connection.user)
        .subscribe(id => {
            console.log("success posting file");
            store.dispatch({ type: "Send_Message_Succeed", sendId, id } as HistoryAction);
        }, error => {
            console.log("failed to post file");
            store.dispatch({ type: "Send_Message_Fail", sendId } as HistoryAction);
        });
    }
}
