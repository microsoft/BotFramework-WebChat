import { Store, Reducer, createStore, combineReducers } from 'redux';
import { Activity, IBotConnection, User } from './directLineTypes';


export interface ShellState {
    text: string,
    enableSend: boolean
}

export type ShellAction = {
    type: 'Update_Shell_Text',
    text: string
} | {
    type: 'Pre_Send_Shell_Text' | 'Fail_Send_Shell_Text' | 'Post_Send_Shell_Text';
}

export const shellReducer: Reducer<ShellState> = (
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

export interface HistoryState {
    activities: Activity[],
    autoscroll: boolean,
    selectedActivity: Activity
}

export type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message',
    activity: Activity
} | {
    type: 'Set_Autoscroll',
    autoscroll: boolean
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
}

export const historyReducer: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        autoscroll: true,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    switch (action.type) {
        case 'Receive_Message':
            return { activities: [... state.activities, action.activity], autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Send_Message':
            return { activities: [... state.activities, action.activity], autoscroll: true, selectedActivity: state.selectedActivity };
        case 'Set_Autoscroll':
            return { activities: state.activities, autoscroll: action.autoscroll, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { activities: state.activities, autoscroll: state.autoscroll, selectedActivity: action.selectedActivity };
        default:
            return state;
    }
}

export interface ChatState {
    shell: ShellState,
    connection: ConnectionState,
    history: HistoryState
}

export const getStore = (): Store<ChatState> => {
    var global = Function('return this')();
    if (!global['msbotchat'])
        global['msbotchat'] = {};
    if (!global['msbotchat'].store)
        global['msbotchat'].store = createStore(
            combineReducers<ChatState>({
                shell: shellReducer,
                connection: connectionReducer,
                history: historyReducer
            }));
    return global['msbotchat'].store;
}

export const getState = () => {
    return getStore().getState();
}
