import * as React from 'react';
import { createStore, combineReducers, Reducer, Action } from 'redux';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, mimeTypes, IBotConnection } from './directLineTypes';
import { DirectLine } from './directLine';
import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { DebugView } from './DebugView';

interface ConnectionState {
    connected: boolean
    botConnection: IBotConnection,
    userId: string,
    host: Window
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    userId: string,
} | {
    type: 'Connected_To_Bot' | 'Unsubscribe_Host'
} | {
    type: 'Subscribe_Host',
    host: Window
}

const connection: Reducer<ConnectionState> = (
    state: ConnectionState = {
        connected: false,
        botConnection: undefined,
        userId: undefined,
        host: undefined
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return { connected: false, botConnection: action.botConnection, userId: action.userId, host: state.host };
        case 'Connected_To_Bot':
            return { connected: true, botConnection: state.botConnection, userId: state.userId, host: state.host  };
        case 'Subscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, userId: state.userId, host: action.host  };
        case 'Unsubscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, userId: state.userId, host: undefined  };
        default:
            return state;
    }
}

interface ShellState {
    text: string,
    enableSend: boolean
}

export type ShellAction = {
    type: 'Update_Shell_Text',
    text: string
} | {
    type: 'Pre_Send_Shell_Text' | 'Fail_Send_Shell_Text' | 'Post_Send_Shell_Text';
}

const shell: Reducer<ShellState> = (
    state: ShellState = {
        text: '',
        enableSend: true
    },
    action: ShellAction
) => {
    switch (action.type) {
        case 'Update_Shell_Text':
            return { text: action.text, enableSend: true };
        case 'Pre_Send_Shell_Text':
            return { text: state.text, enableSend: false }
        case 'Fail_Send_Shell_Text':
            return { text: state.text, enableSend: true }
        case 'Post_Send_Shell_Text':
            return { text: '', enableSend: true };
        default:
            return state;
    }
}

interface HistoryState {
    activities: Activity[],
    autoscroll: boolean
}

export type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message', 
    activity: Activity
} | {
    type: 'Set_Autoscroll',
    autoscroll: boolean
}

const history: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        autoscroll: true
    },
    action: HistoryAction
) => {
    switch (action.type) {
        case 'Receive_Message':
            return { activities: [... state.activities, action.activity], autoscroll: state.autoscroll };
        case 'Send_Message':
            return { activities: [... state.activities, action.activity], autoscroll: true };
        case 'Set_Autoscroll':
            return { activities: state.activities, autoscroll: action.autoscroll };
        default:
            return state;
    }
}

// Visibility state of the DebugView panel 
export enum DebugViewState {
    disabled,   // default: panel and toggle control are both hidden 
    enabled,    // panel is hidden, toggle control is visible
    visible     // panel and toggle control are both visible
}

interface DebugState {
    viewState: DebugViewState,
    selectedActivity: Activity
}

export type DebugAction = {
    type: 'Set_Debug',
    viewState: DebugViewState
} | {
    type: 'Toggle_Debug'
} | {
    type: 'Select_Activity',
    activity: Activity
}

const debug: Reducer<DebugState> = (
    state: DebugState = {
        viewState: DebugViewState.disabled,
        selectedActivity: null
    },
    action: DebugAction
) => {
    switch (action.type) {
        case 'Set_Debug':
            return { viewState: action.viewState, selectedActivity: state.selectedActivity };
        case 'Toggle_Debug':
            if (state.viewState === DebugViewState.enabled)
                return { viewState: DebugViewState.visible, selectedActivity: state.selectedActivity  };
            else if (state.viewState === DebugViewState.visible)
                return { viewState: DebugViewState.enabled, selectedActivity: state.selectedActivity  };
            else
                return { viewState: state.viewState, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { viewState: state.viewState, selectedActivity: action.activity };
        default:
            return state;
    }
}

interface Chat {
    shell: ShellState,
    connection: ConnectionState,
    history: HistoryState,
    debug: DebugState
}

export const store = createStore(combineReducers<Chat>({
    shell,
    connection,
    history,
    debug
}));

const guid = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

interface Props {
    secret?: string,
    token?: string,
    debug?: string,
    title?: string,
    allowMessagesFrom?: string[],
    directLineDomain?: string 
}

export class UI extends React.Component<Props, {}> {
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
                store.dispatch({ type: 'Subscribe_Host', host: event.source } as ConnectionAction)
                break;
            case "unsubscribe":
                store.dispatch({ type: 'Unsubscribe_Host' } as ConnectionAction)
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
        const state = store.getState();
        state.connection.botConnection.postMessage("backchannel", state.connection.userId, { backchannel: event.data })
        .retry(2)
        .subscribe(success => {
            console.log("backchannel message sent to bot");
        }, error => {
            console.log("failed to send backchannel message to bot");
        });
    }

    componentWillMount() {
        console.log("Starting BotChat", this.props);

        let bc = this.props.directLineDomain === "browser" ? new BrowserLine() : new DirectLine({ secret: this.props.secret, token: this.props.token }, this.props.directLineDomain);
        store.dispatch({ type: 'Start_Connection', userId: guid(), botConnection: bc } as ConnectionAction);

        bc.connected$.filter(connected => connected === true).subscribe(connected => { 
            store.dispatch({ type: 'Connected_To_Bot' } as ConnectionAction);
        }); 

        const debug = this.props.debug && this.props.debug.toLowerCase();
        let debugViewState: DebugViewState = DebugViewState.disabled;
        if (debug === DebugViewState[DebugViewState.enabled])
            debugViewState = DebugViewState.enabled;
        else if (debug === DebugViewState[DebugViewState.visible])
            debugViewState = DebugViewState.visible;

        store.dispatch({ type: 'Set_Debug', viewState: debugViewState } as DebugAction);

        bc.activities$.subscribe(
            activity => store.dispatch({ type: 'Receive_Message', activity } as HistoryAction),
            error => console.log("errors", error)
        );

        if (this.props.allowMessagesFrom) {
            console.log("adding event listener for messages from hosting web page");
            window.addEventListener("message", this.receiveBackchannelMessageFromHostingPage, false);
        }

        store.subscribe(() => 
            this.forceUpdate()
        );
    }

    onClickDebug() {
        store.dispatch({ type: 'Toggle_Debug' } as DebugAction);
    }

    render() {
        const state = store.getState();
        console.log("BotChat state", state);
        return (
            <div className="wc-app">
                <div className={ "wc-chatview-panel" + (state.debug.viewState === DebugViewState.visible ? " wc-withdebugview" : "") }>
                    <div className="wc-header">
                        <span>{ this.props.title || "WebChat" }</span>
                        <div className={ "wc-toggledebugview" + (state.debug.viewState !== DebugViewState.disabled ? "" : " wc-hidden") } onClick={ this.onClickDebug }>
                            <svg width="20" height="20" viewBox="0 0 1792 1792">
                                <rect id="panel" height="1152.159352" width="642.020858" y="384.053042" x="959.042634" />
                                <path id="frame" d="m224,1536l608,0l0,-1152l-640,0l0,1120q0,13 9.5,22.5t22.5,9.5zm1376,-32l0,-1120l-640,0l0,1152l608,0q13,0 22.5,-9.5t9.5,-22.5zm128,-1216l0,1216q0,66 -47,113t-113,47l-1344,0q-66,0 -113,-47t-47,-113l0,-1216q0,-66 47,-113t113,-47l1344,0q66,0 113,47t47,113z" />
                            </svg>
                        </div>
                    </div>
                    <History />
                    <Shell />
                </div>
                <div className={ "wc-debugview-panel" + (state.debug.viewState === DebugViewState.visible ? "" : " wc-hidden") }>
                    <div className="wc-header">
                        <span>Debug</span>
                    </div>
                    <DebugView activity={ state.debug.selectedActivity }/>
                </div>
            </div>
        );
    }
}
