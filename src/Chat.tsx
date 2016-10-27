import * as React from 'react';
import { Reducer, Action } from 'redux';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, IBotConnection, User } from './BotConnection';
import { DirectLine } from './directLine';
//import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { getStore, getState, FormatAction, HistoryAction, ConnectionAction } from './Store';
import { strings } from './Strings';

export interface ActivityState {
    status: "received" | "sending" | "sent" | "retry",
    sendId?: number
};

export interface FormatOptions {
    showHeader?: boolean
}

export interface ChatProps {
    user: { id: string, name: string },
    botConnection: IBotConnection,
    locale?: string,
    allowMessageSelection?: boolean,
    formatOptions?: FormatOptions
}

export const Chat = (props: ChatProps) => {
    const store = getStore();
    console.log("BotChat.Chat props", props);

    store.dispatch({ type: 'Start_Connection', user: props.user, botConnection: props.botConnection } as ConnectionAction);

    if (props.formatOptions)
        store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions } as FormatAction);
    
    store.dispatch({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) } as FormatAction);

    props.botConnection.connected$.filter(connected => connected === true).subscribe(connected => {
        store.dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
    });

    props.botConnection.activity$.subscribe(
        activity => store.dispatch({ type: 'Receive_Message', activity } as HistoryAction),
        error => console.log("errors", error)
    );

    const state = store.getState();
    console.log("BotChat.Chat starting state", state);
    let header;
    if (state.format.options.showHeader) header =
        <div className="wc-header">
            <span>{ state.format.strings.title }</span>
        </div>;

    return (
        <div className={ "wc-chatview-panel" }>
            { header }
            <History allowMessageSelection={ props.allowMessageSelection } />
            <Shell />
        </div>
    );
}
