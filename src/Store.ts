import { Store, Reducer, createStore, combineReducers } from 'redux';
import { Activity, IBotConnection, User } from './BotConnection';
import { FormatOptions } from './Chat';
import { strings, Strings } from './Strings';

export interface FormatState {
    options: FormatOptions,
    strings: Strings
}

export type FormatAction = {
    type: 'Set_Format_Options',
    options: FormatOptions
} | {
    type: 'Set_Localized_Strings',
    strings: Strings    
}

export const formatReducer: Reducer<FormatState> = (
    state: FormatState = {
        options: {
            showHeader: true
        },
        strings: strings('en-us')
    },
    action: FormatAction
) => {
    switch (action.type) {
        case 'Set_Format_Options':
            return { options: action.options, strings: state.strings };
        case 'Set_Localized_Strings':
            return { options: state.options, strings: action.strings };
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
    input: string,
    sendCounter: number,
    autoscroll: boolean,
    selectedActivity: Activity
}

export type HistoryAction = {
    type: 'Update_Input',
    input: string
} | {
    type: 'Receive_Message' | 'Send_Message',
    activity: Activity
} | {
    type: 'Send_Message_Try' | 'Send_Message_Succeed' | 'Send_Message_Fail',
    sendId: number
} | {
    type: 'Set_Autoscroll',
    autoscroll: boolean
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
}

const replace = <T>(a: T[], i: number, o: any) => [
    ... a.slice(0, i), 
    Object.assign({}, a[i], o),
    ... a.slice(i + 1)
];

const activityStatus = {
    'Send_Message_Try': "sending",
    'Send_Message_Succeed': "sent",
    'Send_Message_Fail': "retry"
}  

export const historyReducer: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        input: '',
        sendCounter: 0,
        autoscroll: true,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    switch (action.type) {
        case 'Update_Input':
            return { activities: state.activities, input: action.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Receive_Message':
            return { activities: [... state.activities, Object.assign({}, action.activity, { status: "received" })], input: state.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Send_Message':
            return { activities: [... state.activities, Object.assign({}, action.activity, { status: "sending", sendId: state.sendCounter })], input: '', sendCounter: state.sendCounter + 1, autoscroll: true, selectedActivity: state.selectedActivity };
        case 'Send_Message_Try':
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail':
            const i = state.activities.findIndex(activity => activity["sendId"] === action.sendId);
            if (i === -1) return state;
            return {
                activities: replace<Activity>(state.activities, i, { status: activityStatus[action.type] }),
                input: state.input, sendCounter: state.sendCounter + 1, autoscroll: true, selectedActivity: state.selectedActivity
                }
        case 'Set_Autoscroll':
            return { activities: state.activities, input: state.input, sendCounter: state.sendCounter, autoscroll: action.autoscroll, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { activities: state.activities, input: state.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: action.selectedActivity };
        default:
            return state;
    }
}

export interface ChatState {
    format: FormatState,
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
                format: formatReducer,
                connection: connectionReducer,
                history: historyReducer
            }));
    return global['msbotchat'].store;
}

export const getState = () => {
    return getStore().getState();
}
