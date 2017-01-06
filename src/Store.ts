import { Activity, IBotConnection, User, ConnectionStatus } from './BotConnection';
import { FormatOptions, ActivityOrID, konsole } from './Chat';
import { strings, Strings } from './Strings';
import { BehaviorSubject } from 'rxjs';

// Reducers - perform state transformations

import { Reducer } from 'redux';

export enum Actions {
    // Format
    SetFormatOptions,
    SetLocalizedStrings,
    // Connection
    StartConnection,
    ConnectionChange,
    // History
    UpdateInput,
    ReceiveMessage,
    ReceiveSentMessage,
    ShowTyping,
    ClearTyping,
    SendMessage,
    SendMessageTry,
    SendMessageRetry,
    SendMessageFail,
    SendMessageSucceed,
    SelectActivity,
}

export interface FormatState {
    options: FormatOptions,
    strings: Strings
}

export type FormatAction = {
    type: Actions.SetFormatOptions,
    options: FormatOptions
} | {
    type: Actions.SetLocalizedStrings,
    strings: Strings
}

export const format: Reducer<FormatState> = (
    state: FormatState = {
        options: {
            showHeader: true
        },
        strings: strings(window.navigator.language)
    },
    action: FormatAction
) => {
    switch (action.type) {
        case Actions.SetFormatOptions:
            return { options: action.options, strings: state.strings };
        case Actions.SetLocalizedStrings:
            return { options: state.options, strings: action.strings };
        default:
            return state;
    }
}

export interface ConnectionState {
    connectionStatus: ConnectionStatus,
    botConnection: IBotConnection,
    selectedActivity: BehaviorSubject<ActivityOrID>,
    user: User,
    bot: User,
/*  experimental backchannel support
    host: Window
*/
}

export type ConnectionAction = {
    type: Actions.StartConnection,
    botConnection: IBotConnection,
    user: User,
    bot: User,
    selectedActivity: BehaviorSubject<ActivityOrID>
} | {
    type: Actions.ConnectionChange,
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
        case Actions.StartConnection:
            return {
                ... state,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            };
        case Actions.ConnectionChange:
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
    type: Actions.UpdateInput,
    input: string
} | {
    type: Actions.ReceiveMessage | Actions.SendMessage | Actions.ShowTyping | Actions.ReceiveSentMessage
    activity: Activity
} | {
    type: Actions.SendMessageTry | Actions.SendMessageFail| Actions.SendMessageRetry,
    clientActivityId: string
} | {
    type: Actions.SendMessageSucceed
    clientActivityId: string
    id: string
} | {
    type: Actions.SelectActivity,
    selectedActivity: Activity
} | {
    type: Actions.ClearTyping,
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

        case Actions.UpdateInput:
            return {
                ... state,
                input: action.input
            };

        case Actions.ReceiveSentMessage: {
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
        case Actions.ReceiveMessage:
            if (state.activities.find(a => a.id === action.activity.id)) return state; // don't allow duplicate messages

            return {
                ... state, 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ]
            };

        case Actions.SendMessage:
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

        case Actions.SendMessageRetry: {
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
        case Actions.SendMessageSucceed:
        case Actions.SendMessageFail: {
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            if (i === -1) return state;

            const activity = state.activities[i];
            if (activity.id && activity.id != "retry") return state;

            const newActivity = {
                ... activity,
                id: action.type === Actions.SendMessageSucceed ? action.id : null                        
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
        case Actions.ShowTyping:
            return {
                ... state, 
                activities: [
                    ... state.activities.filter(activity => activity.type !== "typing"),
                    ... state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ]
            };

        case Actions.ClearTyping:
            return {
                ... state, 
                activities: state.activities.filter(activity => activity.id !== action.id),
                selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity
            };

        case Actions.SelectActivity:
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
    action$.ofType(Actions.SendMessage)
    .map(action => {
        const state = store.getState();
        const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
        return ({ type: Actions.SendMessageTry, clientActivityId } as HistoryAction);
    });

const trySendMessage: Epic<HistoryAction> = (action$, store: MiddlewareAPI<ChatState>) =>
    action$.ofType(Actions.SendMessageTry)
    .flatMap(action => {
        const state = store.getState();
        const clientActivityId = action.clientActivityId;
        const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
        if (!activity) {
            konsole.log("trySendMessage: activity not found");
            return Observable.empty<HistoryAction>();
        }

        return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: Actions.SendMessageSucceed, clientActivityId, id } as HistoryAction))
        .catch(error => Observable.of({ type: Actions.SendMessageFail, clientActivityId } as HistoryAction))
    });

const retrySendMessage: Epic<HistoryAction> = (action$) =>
    action$.ofType(Actions.SendMessageRetry)
    .map(action => ({ type: Actions.SendMessageTry, clientActivityId: action.clientActivityId } as HistoryAction));

const updateSelectedActivity: Epic<HistoryAction> = (action$, store: MiddlewareAPI<ChatState>) =>
    action$.ofType(
        Actions.SendMessageSucceed,
        Actions.SendMessageFail,
        Actions.ShowTyping,
        Actions.ClearTyping
    )
    .map(action => {
        const state = store.getState();
        if (state.connection.selectedActivity)
            state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
        return { type: null } as HistoryAction;
    });

const showTyping: Epic<HistoryAction> = (action$) =>
    action$.ofType(Actions.ShowTyping)
    .delay(3000)
    .map(action => ({ type: Actions.ClearTyping, id: action.activity.id } as HistoryAction));

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

