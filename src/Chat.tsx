import * as React from 'react';
import { Subscription } from '@reactivex/rxjs';
import { Activity, Message, IBotConnection, User } from './BotConnection';
import { DirectLine } from './directLine';
//import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
import { strings } from './Strings';

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

    store: ChatStore;
    activitySubscription: Subscription;
    connectedSubscription: Subscription;

    constructor(props) {
        super(props);

        this.store = createStore();

        console.log("BotChat.Chat props", props);

        this.store.dispatch({ type: 'Start_Connection', user: props.user, botConnection: props.botConnection } as ConnectionAction);

        if (props.formatOptions)
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions } as FormatAction);

        this.store.dispatch({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) } as FormatAction);

        this.connectedSubscription = props.botConnection.connected$.filter(connected => connected === true).subscribe(connected => {
            this.store.dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
        });

        this.activitySubscription = props.botConnection.activity$.subscribe(
            activity => this.handleActivity(activity),
            error => console.log("errors", error)
        );
    }

    handleActivity(activity: Activity) {
        this.store.dispatch({ type: 'Receive_Message', activity } as HistoryAction);
    }

    componentWillUnmount() {
        this.activitySubscription.unsubscribe();
        this.connectedSubscription.unsubscribe();
    }

    render() {
        const state = this.store.getState();
        console.log("BotChat.Chat starting state", state);
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
