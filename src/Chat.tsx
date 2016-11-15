import * as React from 'react';
import { Subscription, BehaviorSubject } from '@reactivex/rxjs';
import { Activity, Media, IBotConnection, User, MediaType } from './BotConnection';
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
    private connectedSubscription: Subscription;
    private selectedActivitySubscription: Subscription;
    private typingTimers = {};

    constructor(props: ChatProps) {
        super(props);

        console.log("BotChat.Chat props", props);

        this.store.dispatch({ type: 'Start_Connection', user: props.user, bot: props.bot, botConnection: props.botConnection, selectedActivity: props.selectedActivity } as ConnectionAction);

        if (props.formatOptions)
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions } as FormatAction);

        this.store.dispatch({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) } as FormatAction);

        props.botConnection.start();
        this.connectedSubscription = props.botConnection.connected$.filter(connected => connected === true).subscribe(connected => {
            this.store.dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
        });
        this.activitySubscription = props.botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => console.log("activity$ error", error) // THIS IS WHERE WE WILL CHANGE THE APP STATE
        );

        if (props.selectedActivity) {
            this.selectedActivitySubscription = props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                } as HistoryAction);
            })
        } else {
            this.selectActivity = null; // doing this here saves us a ternary branch when calling <History> in render()
        }
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
                    activity = Object.assign({}, activity, { type: 'typing' });
                    // fall through to "typing" case 
                } else {
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
                    updateSelectedActivity(this.store);
                }, 3000);
                break;
        }
    }

    private selectActivity(activity: Activity) {
        this.props.selectedActivity.next({ activity });
    }

    componentDidMount() {
        this.storeUnsubscribe = this.store.subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.activitySubscription.unsubscribe();
        this.connectedSubscription.unsubscribe();
        this.selectedActivitySubscription.unsubscribe();
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
                <History store={ this.store } selectActivity={ activity => this.selectActivity(activity) } />
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
    console.log("success sending message", id);
    store.dispatch({ type: "Send_Message_Succeed", clientActivityId, id } as HistoryAction);
    updateSelectedActivity(store);
}

const sendMessageFail = (store: ChatStore, clientActivityId: string) => (error) => {
    console.log("failed to send message", error);
    // TODO: show an error under the message with "retry" link
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
        console.log("trySendMessage: activity not found");
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
        console.log("success sending postBack", id)
    }, error => {
        console.log("failed to send postBack", error);
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
