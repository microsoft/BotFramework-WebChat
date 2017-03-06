import * as React from 'react';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Activity, Media, IBotConnection, User, MediaType, DirectLine, DirectLineOptions } from 'botframework-directlinejs';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, ShellAction, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
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
    sendTyping?: boolean,
    formatOptions?: FormatOptions,
    resize?: 'none' | 'window' | 'detect'
}

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();

    private botConnection: IBotConnection;
    
    private activitySubscription: Subscription;
    private connectionStatusSubscription: Subscription;
    private selectedActivitySubscription: Subscription;

    private chatviewPanel: HTMLElement;
    private resizeListener = () => this.setSize();

    constructor(props: ChatProps) {
        super(props);

        konsole.log("BotChat.Chat props", props);

        this.store.dispatch<FormatAction>({
            type: 'Set_Locale',
            locale: props.locale || window.navigator["userLanguage"] || window.navigator.language || 'en'
        });

        if (props.formatOptions)
            this.store.dispatch<FormatAction>({ type: 'Set_Format_Options', options: props.formatOptions });
        
        if (props.sendTyping)
            this.store.dispatch<ShellAction>({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });        
    }

    private handleIncomingActivity(activity: Activity) {
        let state = this.store.getState();
        switch (activity.type) {

            case "message":
                this.store.dispatch<HistoryAction>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;

            case "typing":
                if (activity.from.id !== state.connection.user.id)
                    this.store.dispatch<HistoryAction>({ type: 'Show_Typing', activity });
                break;
        }
    }

    private setSize() {
        this.store.dispatch<FormatAction>({
            type: 'Set_Size',
            width: this.chatviewPanel.offsetWidth,
            height: this.chatviewPanel.offsetHeight
        });
    }

    componentDidMount() {
        // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
        this.setSize();

        const botConnection = this.props.directLine
            ? (this.botConnection = new DirectLine(this.props.directLine))
            : this.props.botConnection
            ;

        if (this.props.resize === 'window')
            window.addEventListener('resize', this.resizeListener);

        this.store.dispatch<ConnectionAction>({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });

        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus =>
            this.store.dispatch<ConnectionAction>({ type: 'Connection_Change', connectionStatus })
        );

        this.activitySubscription = botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => konsole.log("activity$ error", error)
        );

        if (this.props.selectedActivity) {
            this.selectedActivitySubscription = this.props.selectedActivity.subscribe(activityOrID => {
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
        window.removeEventListener('resize', this.resizeListener);
    }

    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity

    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);

        // only render real stuff after we know our dimensions
        let header: JSX.Element;
        if (state.format.options.showHeader) header =
            <div className="wc-header">
                <span>{ state.format.strings.title }</span>
            </div>;

        let resize: JSX.Element;
        if (this.props.resize === 'detect') resize =
            <ResizeDetector onresize={ this.resizeListener } />;

        return (
            <Provider store={ this.store }>
                <div className="wc-chatview-panel" ref={ div => this.chatviewPanel = div }>
                    { header }
                    <History />
                    <Shell />
                    { resize }
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

// note: container of this element must have CSS position of either absolute or relative
const ResizeDetector = (props: {
    onresize: () => void
}) =>
    // adapted to React from https://github.com/developit/simple-element-resize-detector
    <iframe
        style={ { position: 'absolute', left: '0', top: '-100%', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' } }
        ref={ frame => frame.contentWindow.onresize = props.onresize }
    />;
