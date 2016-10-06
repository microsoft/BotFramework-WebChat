import * as React from 'react';
import { createStore, combineReducers, Reducer, Action } from 'redux';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { Activity, Message, Conversation } from './directLineTypes';
import { startConversation, getActivities, postMessage, postFile, mimeTypes } from './directLine';
import { History } from './History';
import { Shell } from './Shell';
import { DebugView } from './DebugView';

interface ConnectionState {
    conversation: Conversation,
    userId: string
}

export type ConnectionAction = {
    type: 'Set_UserId', 
    userId: string
} | {
    type: 'Connected_To_Bot',
    conversation: Conversation
}

const connection: Reducer<ConnectionState> = (
    state: ConnectionState = {
        conversation: undefined,
        userId: undefined,
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Set_UserId':
            return { conversation: state.conversation, userId: action.userId };
        case 'Connected_To_Bot':
            return { conversation: action.conversation, userId: state.userId };
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
    appSecret?: string,
    token?: string,
    debug: string
}

export class UI extends React.Component<Props, {}> {
    constructor() {
        super();
    }

    componentWillMount() {
        console.log("Starting BotChat", this.props);
        store.subscribe(() => 
            this.forceUpdate()
        );

        store.dispatch({ type: 'Set_UserId', userId:guid() } as ConnectionAction);

        const debug = this.props.debug && this.props.debug.toLowerCase();
        let debugViewState: DebugViewState = DebugViewState.disabled;
        if (debug === DebugViewState[DebugViewState.enabled])
            debugViewState = DebugViewState.enabled;
        else if (debug === DebugViewState[DebugViewState.visible])
            debugViewState = DebugViewState.visible;

        store.dispatch({ type: 'Set_Debug', viewState: debugViewState } as DebugAction);

        startConversation(this.props.appSecret || this.props.token)
        .do(conversation => {
            store.dispatch({ type: 'Connected_To_Bot', conversation } as ConnectionAction)
        })
        .flatMap(conversation =>
            getActivities(conversation)
        )
        .subscribe(
            activity => store.dispatch({ type: 'Receive_Message', activity } as HistoryAction),
            error => console.log("errors", error)
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
                        <span>WebChat</span>
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
