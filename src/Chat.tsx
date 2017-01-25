import * as React from 'react';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Activity, Media, IBotConnection, User, MediaType, DirectLine, DirectLineOptions } from 'botframework-directlinejs';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
import { Dispatch, Provider } from 'react-redux';

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
    botConnection?: IBotConnection,
    directLine?: DirectLineOptions,
    locale?: string,
    selectedActivity?: BehaviorSubject<ActivityOrID>,
    formatOptions?: FormatOptions
}

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();

    private botConnection: IBotConnection;
    
    private activitySubscription: Subscription;
    private connectionStatusSubscription: Subscription;
    private selectedActivitySubscription: Subscription;

    constructor(props: ChatProps) {
        super(props);

        konsole.log("BotChat.Chat props", props);

        this.store.dispatch<FormatAction>({
            type: 'Set_Locale',
            locale: props.locale || window.navigator["userLanguage"] || window.navigator.language || 'en'
        });

        if (props.formatOptions)
            this.store.dispatch<FormatAction>({ type: 'Set_Format_Options', options: props.formatOptions });
    }

    private handleIncomingActivity(activity: Activity) {
        let state = this.store.getState();
        switch (activity.type) {

            case "message":
                this.store.dispatch<HistoryAction>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;

            case "typing":
                this.store.dispatch<HistoryAction>({ type: 'Show_Typing', activity });
                break;
        }
    }

    componentDidMount() {
        const props = this.props;

        const botConnection = this.props.directLine
            ? (this.botConnection = new DirectLine(this.props.directLine))
            : this.props.botConnection
            ;

        this.store.dispatch<ConnectionAction>({ type: 'Start_Connection', user: props.user, bot: props.bot, botConnection, selectedActivity: props.selectedActivity });

        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus =>
            this.store.dispatch<ConnectionAction>({ type: 'Connection_Change', connectionStatus })
        );

        this.activitySubscription = botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => konsole.log("activity$ error", error)
        );

        if (props.selectedActivity) {
            this.selectedActivitySubscription = props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch<HistoryAction>({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                });
            });
        }
    }

    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        if (this.botConnection)
            this.botConnection.end();
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
            <Provider store={ this.store }>
                <div className={ "wc-chatview-panel" }>
                    { header }
                    <History />
                    <Shell />
                </div>
            </Provider>
        );
    }
}

export const sendMessage = (dispatch: Dispatch<HistoryAction>, text: string, from: User, locale: string) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0)
        return;
    dispatch({ type: 'Send_Message', activity: {
        type: "message",
        text,
        from,
        locale,
        timestamp: (new Date()).toISOString()
    }});
}

export const sendPostBack = (botConnection: IBotConnection, text: string, from: User, locale: string) => {
    botConnection.postActivity({
        type: "message",
        text,
        from,
        locale
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

export const sendFiles = (dispatch: Dispatch<HistoryAction>, files: FileList, from: User, locale: string) => {
    dispatch({ type: 'Send_Message', activity: {
        type: "message",
        attachments: attachmentsFromFiles(files),
        from,
        locale
    }});
}

export const renderIfNonempty = (value: any, renderer: (value: any) => JSX.Element ) => {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
}

export const konsole = {
    log: (message?: any, ... optionalParams: any[]) => {
        if (typeof(window) !== 'undefined' && window["botchatDebug"] && message)
            console.log(message, ... optionalParams);
    }
}