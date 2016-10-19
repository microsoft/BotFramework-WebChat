import * as React from 'react';
import { Reducer, Action } from 'redux';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, mimeTypes, IBotConnection, User } from './directLineTypes';
import { DirectLine } from './directLine';
import { BrowserLine } from './browserLine';
import { History, HistoryAction, HistoryProps } from './History';
import { Shell } from './Shell';
import { getStore, getState } from './Store';
import { IConsoleProvider, BuiltinConsoleProvider } from './Console';


export interface ConnectionState {
    connected: boolean
    botConnection: IBotConnection,
    user: User,
    host: Window
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    user: User,
} | {
    type: 'Connected_To_Bot' | 'Unsubscribe_Host'
} | {
    type: 'Subscribe_Host',
    host: Window
}

export const connectionReducer: Reducer<ConnectionState> = (
    state: ConnectionState = {
        connected: false,
        botConnection: undefined,
        user: undefined,
        host: undefined
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return { connected: false, botConnection: action.botConnection, user: action.user, host: state.host };
        case 'Connected_To_Bot':
            return { connected: true, botConnection: state.botConnection, user: state.user, host: state.host  };
        case 'Subscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: action.host  };
        case 'Unsubscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: undefined  };
        default:
            return state;
    }
}

export interface UIProps {
    devConsole?: IConsoleProvider,
    user: { id: string, name: string },
    secret?: string,
    token?: string,
    title?: string,
    allowMessagesFrom?: string[],
    directLineDomain?: string,
    historyProps: HistoryProps
}

export class UI extends React.Component<UIProps, {}> {
    storeUnsubscribe: any;
    devConsole: IConsoleProvider;

    constructor() {
        super();
    }

    receiveBackchannelMessageFromHostingPage = (event: MessageEvent) => {
        if (!this.props.allowMessagesFrom || this.props.allowMessagesFrom.indexOf(event.origin) === -1) {
            console.log("Rejecting backchannel message from unknown source", event.source);
            return;
        }

        if (!event.data || !event.data.type) {
            console.log("Empty or typeless backchannel message from source", event.source);
            return;
        }

        console.log("Received backchannel message", event.data, "from", event.source);

        switch (event.data.type) {
            case "subscribe":
                getStore().dispatch({ type: 'Subscribe_Host', host: event.source } as ConnectionAction)
                break;
            case "unsubscribe":
                getStore().dispatch({ type: 'Unsubscribe_Host' } as ConnectionAction)
                break;
            case "send":
                if (!event.data.contents) {
                    console.log("Backchannel message has no contents");
                    return;
                }
                break;
            default:
                console.log("unknown message type", event.data.type);
                return;
        }
        const state = getState();
        state.connection.botConnection.postMessage("backchannel", state.connection.user, { backchannel: event.data })
        .retry(2)
        .subscribe(success => {
            console.log("backchannel message sent to bot");
        }, error => {
            console.log("failed to send backchannel message to bot");
        });
    }

    componentWillMount() {
        this.devConsole = this.props.devConsole || new BuiltinConsoleProvider();

        this.devConsole.log("Starting BotChat", this.props);

        let bc = this.props.directLineDomain === "browser" ? new BrowserLine() : new DirectLine({ secret: this.props.secret, token: this.props.token }, this.props.directLineDomain, this.devConsole);
        getStore().dispatch({ type: 'Start_Connection', user: this.props.user, botConnection: bc } as ConnectionAction);

        bc.connected$.filter(connected => connected === true).subscribe(connected => {
            getStore().dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
        });

        bc.activities$.subscribe(
            activity => getStore().dispatch({ type: 'Receive_Message', activity } as HistoryAction),
            error => this.devConsole.log("errors", error)
        );

        if (this.props.allowMessagesFrom) {
            console.log("adding event listener for messages from hosting web page");
            window.addEventListener("message", this.receiveBackchannelMessageFromHostingPage, false);
        }

        this.storeUnsubscribe = getStore().subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    render() {
        const state = getState();
        console.log("BotChat state", state);
        return (
            <div>
                <History { ...this.props.historyProps } />
                <Shell />
            </div>
        );
    }
}
