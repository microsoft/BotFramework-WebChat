import { Activity, IBotConnection, User, ConnectionStatus } from './BotConnection';
import { FormatOptions, ActivityOrID, konsole } from './Chat';
import { strings, Strings } from './Strings';
import { BehaviorSubject } from 'rxjs';

// Reducers - perform state transformations

import { Reducer } from 'redux';

export interface FormatState {
    locale: string,
    options: FormatOptions,
    strings: Strings
}

export type FormatAction = {
    type: 'Set_Format_Options',
    options: FormatOptions,
} | {
    type: 'Set_Locale',
    locale: string
}

export const format: Reducer<FormatState> = (
    state: FormatState = {
        locale: window.navigator.language,
        options: {
            showHeader: true
        },
        strings: strings(window.navigator.language)
    },
    action: FormatAction
) => {
    switch (action.type) {
        case 'Set_Format_Options':
            return {
                options: action.options,
                ... state
            };
        case 'Set_Locale':
            return {
                locale: action.locale,
                strings: strings(action.locale),
                ... state
            };
        default:
            return state;
    }
}

export interface ConnectionState {
    connectionStatus: ConnectionStatus,
    botConnection: IBotConnection,
    selectedActivity: BehaviorSubject<ActivityOrID>,
    user: User,
    bot: User
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    user: User,
    bot: User,
    selectedActivity: BehaviorSubject<ActivityOrID>
} | {
    type: 'Connection_Change',
    connectionStatus: ConnectionStatus
}

export const connection: Reducer<ConnectionState> = (
    state: ConnectionState = {
        connectionStatus: ConnectionStatus.Uninitialized,
        botConnection: undefined,
        selectedActivity: undefined,
        user: undefined,
        bot: undefined
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return {
                ... state,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            };
        case 'Connection_Change':
            return {
                ... state,
                connectionStatus: action.connectionStatus
            };
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
    type: 'Send_Message_Try' | 'Send_Message_Fail' | 'Send_Message_Retry',
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
    id: string
}

export const history: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        input: '',
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    konsole.log("history action", action);
    switch (action.type) {

        case 'Update_Input':
            return {
                ... state,
                input: action.input
            };

        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId
            );
            if (i !== -1) {
                const activity = state.activities[i];
                return {
                    ... state,
                    activities: [
                        ... state.activities.slice(0, i),
                        action.activity,
                        ... state.activities.slice(i + 1)
                    ],
                    selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity
                };
            }
            // else fall through and treat this as a new message
        }
        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id)) return state; // don't allow duplicate messages

            return {
                ... state, 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ]
            };

        case 'Send_Message':
            return {
                ... state,
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    {
                        ... action.activity,
                        timestamp: (new Date()).toISOString(),
                        channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter }
                    },
                    ... state.activities.filter(activity => activity.type === "typing"),
                ],
                input: '',
                clientActivityCounter: state.clientActivityCounter + 1
            };

        case 'Send_Message_Retry': {
            const activity = state.activities.find(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            const newActivity = activity.id === undefined ? activity : { ... activity, id: undefined };
            return {
                ... state,
                activities: [
                    ... state.activities.filter(activityT => activityT.type !== "typing" && activityT !== activity),
                    newActivity,
                    ... state.activities.filter(activity => activity.type === "typing")
                ],
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            if (i === -1) return state;

            const activity = state.activities[i];
            if (activity.id && activity.id != "retry") return state;

            const newActivity = {
                ... activity,
                id: action.type === 'Send_Message_Succeed' ? action.id : null                        
            };
            return {
                ... state,
                activities: [
                    ... state.activities.slice(0, i),
                    newActivity,
                    ... state.activities.slice(i + 1)
                ],
                clientActivityCounter: state.clientActivityCounter + 1,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Show_Typing':
            return {
                ... state, 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ]
            };

        case 'Clear_Typing':
            return {
                ... state, 
                activities: state.activities.filter(activity => activity.id !== action.id),
                selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity
            };

        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity) return state;
            return {
                ... state,
                selectedActivity: action.selectedActivity
            };

        default:
            return state;
    }
}

export interface ChatState {
    format: FormatState,
    connection: ConnectionState,
    history: HistoryState
}

// Epics - chain actions together with async operations

import { MiddlewareAPI, applyMiddleware } from 'redux';
import { Epic } from 'redux-observable';
import { Observable } from 'rxjs';

const sendMessage: Epic<HistoryAction> = (action$, store: MiddlewareAPI<ChatState>) =>
    action$.ofType('Send_Message')
    .map(action => {
        const state = store.getState();
        const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
        return ({ type: 'Send_Message_Try', clientActivityId } as HistoryAction);
    });

const trySendMessage: Epic<HistoryAction> = (action$, store: MiddlewareAPI<ChatState>) =>
    action$.ofType('Send_Message_Try')
    .flatMap(action => {
        const state = store.getState();
        const clientActivityId = action.clientActivityId;
        const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
        if (!activity) {
            konsole.log("trySendMessage: activity not found");
            return Observable.empty<HistoryAction>();
        }

        return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: 'Send_Message_Succeed', clientActivityId, id } as HistoryAction))
        .catch(error => Observable.of({ type: 'Send_Message_Fail', clientActivityId } as HistoryAction))
    });

const retrySendMessage: Epic<HistoryAction> = (action$) =>
    action$.ofType('Send_Message_Retry')
    .map(action => ({ type: 'Send_Message_Try', clientActivityId: action.clientActivityId } as HistoryAction));

const updateSelectedActivity: Epic<HistoryAction> = (action$, store: MiddlewareAPI<ChatState>) =>
    action$.ofType(
        'Send_Message_Succeed',
        'Send_Message_Fail',
        'Show_Typing',
        'Clear_Typing'
    )
    .map(action => {
        const state = store.getState();
        if (state.connection.selectedActivity)
            state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
        return { type: null } as HistoryAction;
    });

const showTyping: Epic<HistoryAction> = (action$) =>
    action$.ofType('Show_Typing')
    .delay(3000)
    .map(action => ({ type: 'Clear_Typing', id: action.activity.id } as HistoryAction));

// Now we put it all together into a store with middleware

import { Store, createStore as reduxCreateStore, combineReducers } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

export const createStore = () =>
    reduxCreateStore(
        combineReducers<ChatState>({
            format,
            connection,
            history
        }),
        applyMiddleware(createEpicMiddleware(combineEpics(
            updateSelectedActivity,
            sendMessage,
            trySendMessage,
            retrySendMessage,
            showTyping
        )))
    );

export type ChatStore = Store<ChatState>;

