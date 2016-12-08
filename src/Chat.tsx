import * as React from 'react';
import { Subscription, BehaviorSubject, Observable, Subject } from '@reactivex/rxjs';
import { Activity, Media, IBotConnection, User, MediaType, ConnectionStatus } from './BotConnection';
import { DirectLine } from './directLine';
//import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
import { strings } from './Strings';
import { Unsubscribe } from 'redux';

export interface FormatOptions {
    showHeader?: boolean
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}

export interface ChatProps {
    user: User,
    bot: User,
    botConnection: IBotConnection,
    locale?: string,
    selectedActivity?: BehaviorSubject<ActivityOrID>,
    formatOptions?: FormatOptions
}

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();
    private storeUnsubscribe: Unsubscribe;
    
    private activitySubscription: Subscription;
    private typingActivitySubscription: Subscription;
    private connectionStatusSubscription: Subscription;
    private selectedActivitySubscription: Subscription;

    private selectActivityCallback: (activity: Activity) => void;

    private typingActivity$ = new Subject<Activity>();

    constructor(props: ChatProps) {
        super(props);

        konsole.log("BotChat.Chat props", props);

        if (props.formatOptions)
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions } as FormatAction);

        this.store.dispatch({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) } as FormatAction);
    }

    private handleIncomingActivity(activity: Activity) {
        let state = this.store.getState();
        switch (activity.type) {

            case "message":
                if (activity.from.id === state.connection.user.id) {
                    this.store.dispatch({ type: 'Receive_Sent_Message', activity } as HistoryAction);
                    break;
                } else if (activity.text && activity.text.endsWith("//typing")) {
                    // 'typing' activity only available with WebSockets, so this allows us to test with polling GET
                    activity = { ... activity, type: 'typing' };
                    // fall through to "typing" case 
                } else {
                    this.store.dispatch({ type: 'Receive_Message', activity } as HistoryAction);
                    break;
                }

            case "typing":
                this.typingActivity$.next(activity);
                break;
        }
    }

    private selectActivity(activity: Activity) {
        this.props.selectedActivity.next({ activity });
    }

    componentDidMount() {
        let props = this.props;

        this.store.dispatch({ type: 'Start_Connection', user: props.user, bot: props.bot, botConnection: props.botConnection, selectedActivity: props.selectedActivity } as ConnectionAction);

        props.botConnection.start();
        this.connectionStatusSubscription = props.botConnection.connectionStatus$.subscribe(connectionStatus =>
            this.store.dispatch({ type: 'Connection_Change', connectionStatus } as ConnectionAction)
        );

        this.activitySubscription = props.botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => konsole.log("activity$ error", error)
        );

        this.typingActivitySubscription = this.typingActivity$.do(activity => {
            this.store.dispatch({ type: 'Show_Typing', activity } as HistoryAction)
            updateSelectedActivity(this.store);
        })
        .delay(3000)
        .subscribe(activity => {
            this.store.dispatch({ type: 'Clear_Typing', id: activity.id } as HistoryAction);
            updateSelectedActivity(this.store);
        });

        if (props.selectedActivity) {
            this.selectActivityCallback = activity => this.selectActivity(activity);
            this.selectedActivitySubscription = props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                } as HistoryAction);
            });
        }

        this.storeUnsubscribe = this.store.subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        this.typingActivitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        this.props.botConnection.end();
        this.storeUnsubscribe();
    }

    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);
        let header;
        if (state.format.options.showHeader) header =
            <div className="wc-header">
                <span>{ state.format.strings.title }</span>
            </div>;

        return (
            <div className={ "wc-chatview-panel" }>
                { header }
                <History store={ this.store } selectActivity={ this.selectActivityCallback } />
                <Shell store={ this.store } />
            </div>
        );
    }
}

export const updateSelectedActivity = (store: ChatStore) => {
    const state = store.getState();
    if (state.connection.selectedActivity)
        state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
}

export const sendMessage = (store: ChatStore, text: string) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0)
        return;
    let state = store.getState();
    const clientActivityId = state.history.clientActivityBase + state.history.clientActivityCounter;
    store.dispatch({
        type: 'Send_Message',
        activity: {
            type: "message",
            text,
            from: state.connection.user,
            timestamp: (new Date()).toISOString()
        }
    } as HistoryAction);
    trySendMessage(store, clientActivityId);
}

const sendMessageSucceed = (store: ChatStore, clientActivityId: string) => (id: string) => {
    konsole.log("success sending message", id);
    store.dispatch({ type: "Send_Message_Succeed", clientActivityId, id } as HistoryAction);
    updateSelectedActivity(store);
}

const sendMessageFail = (store: ChatStore, clientActivityId: string) => (error) => {
    konsole.log("failed to send message", error);
    store.dispatch({ type: "Send_Message_Fail", clientActivityId } as HistoryAction);
    updateSelectedActivity(store);
}

export const trySendMessage = (store: ChatStore, clientActivityId: string, updateStatus = false) => {
    if (updateStatus) {
        store.dispatch({ type: "Send_Message_Try", clientActivityId } as HistoryAction);
    }
    let state = store.getState();
    const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
    if (!activity) {
        konsole.log("trySendMessage: activity not found");
        return;
    }
    
    (activity.type === 'message' && activity.attachments && activity.attachments.length > 0
        ? state.connection.botConnection.postMessageWithAttachments(activity)
        : state.connection.botConnection.postActivity(activity)
    ).subscribe(
        sendMessageSucceed(store, clientActivityId),
        sendMessageFail(store, clientActivityId)
    );
}

export const sendPostBack = (store: ChatStore, text: string) => {
    const state = store.getState();
    state.connection.botConnection.postActivity({
        type: "message",
        text,
        from: state.connection.user
    })
    .subscribe(id => {
        konsole.log("success sending postBack", id)
    }, error => {
        konsole.log("failed to send postBack", error);
    });
}

const attachmentsFromFiles = (files: FileList) => {
    const attachments: Media[] = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type as MediaType,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
}

export const sendFiles = (store: ChatStore, files: FileList) => {
    let state = store.getState();
    const clientActivityId = state.history.clientActivityBase + state.history.clientActivityCounter;
    store.dispatch({
        type: 'Send_Message',
        activity: {
            type: "message",
            attachments: attachmentsFromFiles(files),
            from: state.connection.user
        }
    } as HistoryAction);
    trySendMessage(store, clientActivityId);
}

export const renderIfNonempty = (value: any, renderer: (value: any) => JSX.Element ) => {
    if (typeof value === 'string' && value.length === 0) return;
    return renderer(value);
}

export const konsole = {
    log: (message?: any, ... optionalParams: any[]) => {
        if (typeof(window) !== 'undefined' && window["botchatDebug"] === true && message)
            console.log(message, ... optionalParams);
    }
}