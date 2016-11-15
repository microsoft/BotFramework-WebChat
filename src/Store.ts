import { Store, Reducer, createStore as reduxCreateStore, combineReducers } from 'redux';
import { Activity, IBotConnection, User } from './BotConnection';
import { FormatOptions, ActivityOrID } from './Chat';
import { strings, Strings } from './Strings';
import { BehaviorSubject } from '@reactivex/rxjs';

export type ChatStore = Store<ChatState>;

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
    selectedActivity: BehaviorSubject<ActivityOrID>,
    user: User,
    bot: User,
    host: Window
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    user: User,
    bot: User,
    selectedActivity: BehaviorSubject<ActivityOrID>
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
        selectedActivity: undefined,
        user: undefined,
        bot: undefined,
        host: undefined
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return Object.assign({}, state, {
                connected: false,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            });
        case 'Connected_To_Bot':
            return Object.assign({}, state, {
                connected: true
            });
        case 'Subscribe_Host':
            return Object.assign({}, state, {
                host: action.host
            });
        case 'Unsubscribe_Host':
            return Object.assign({}, state, {
                host: undefined
            });
        default:
            return state;
    }
}

export interface HistoryState {
    activities: Activity[],
    input: string,
    clientActivityBase: string,
    clientActivityCounter: number,
    selectedActivity: Activity
}

export type HistoryAction = {
    type: 'Update_Input',
    input: string
} | {
    type: 'Receive_Message' | 'Send_Message' | 'Show_Typing' | 'Receive_Sent_Message'
    activity: Activity
} | {
    type: 'Send_Message_Try' | 'Send_Message_Fail',
    clientActivityId: string
} | {
    type: 'Send_Message_Succeed'
    clientActivityId: string
    id: string
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
} | {
    type: 'Clear_Typing',
    from: User
}

export const historyReducer: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        input: '',
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    console.log("history action", action);
    switch (action.type) {
        case 'Update_Input':
            return Object.assign({}, state, {
                input: action.input
            });
        case 'Receive_Sent_Message': {
            const i = state.activities.findIndex(activity =>
                activity.channelData && action.activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId
            );
            if (i !== -1) {
                const activity = state.activities[i];
                return Object.assign({}, state, {
                    activities: [
                        ... state.activities.slice(0, i),
                        action.activity,
                        ... state.activities.slice(i + 1)
                    ],
                    selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity
                });
            }
            // else fall through and treat this as a new message
        }
        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id)) {
                 // don't allow duplicate messages
                 return state;
            }
            return Object.assign({}, state, { 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ]
            });

        case 'Send_Message':
            return Object.assign({}, state, {
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    Object.assign({}, action.activity, {
                        timestamp: (new Date()).toISOString(),
                        channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter }
                    }),
                    ... state.activities.filter(activity => activity.type === "typing"),
                ],
                input: '',
                clientActivityCounter: state.clientActivityCounter + 1
            });

        case 'Send_Message_Try':
        {
            const activity = state.activities.find(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            const newActivity = activity.id === undefined ? activity : Object.assign({}, activity, { id: undefined });
            return Object.assign({}, state, {
                activities: [
                    ... state.activities.filter(activityT => activityT.type !== "typing" && activityT !== activity),
                    newActivity,
                    ... state.activities.filter(activity => activity.type === "typing")
                ],
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            });
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            if (i === -1) return state;
            const activity = state.activities[i];
            const newActivity = Object.assign({}, activity, {
                id: action.type === 'Send_Message_Succeed' ? action.id : null                        
            })
            return Object.assign({}, state, {
                activities: [
                    ... state.activities.slice(0, i),
                    newActivity,
                    ... state.activities.slice(i + 1)
                ],
                clientActivityCounter: state.clientActivityCounter + 1,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            });
        }
        case 'Show_Typing':
            return Object.assign({}, state, { 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ]
            });

        case 'Clear_Typing': {
            const activities = state.activities.filter(activity => activity.from.id !== action.from.id || activity.type !== "typing")
            return Object.assign({}, state, { 
                activities,
                selectedActivity: activities.includes(state.selectedActivity) ? state.selectedActivity : null
            });
        }
        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity)
                return state;
            return Object.assign({}, state, {
                selectedActivity: action.selectedActivity
            });

        default:
            return state;
    }
}

export interface ChatState {
    format: FormatState,
    connection: ConnectionState,
    history: HistoryState
}

export const createStore = () =>
    reduxCreateStore(
        combineReducers<ChatState>({
            format: formatReducer,
            connection: connectionReducer,
            history: historyReducer
        }));
