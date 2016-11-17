"use strict";
var redux_1 = require('redux');
var BotConnection_1 = require('./BotConnection');
var Strings_1 = require('./Strings');
exports.formatReducer = function (state, action) {
    if (state === void 0) { state = {
        options: {
            showHeader: true
        },
        strings: Strings_1.strings('en-us')
    }; }
    switch (action.type) {
        case 'Set_Format_Options':
            return { options: action.options, strings: state.strings };
        case 'Set_Localized_Strings':
            return { options: state.options, strings: action.strings };
        default:
            return state;
    }
};
exports.connectionReducer = function (state, action) {
    if (state === void 0) { state = {
        connectionStatus: BotConnection_1.ConnectionStatus.Connecting,
        botConnection: undefined,
        selectedActivity: undefined,
        user: undefined,
        bot: undefined
    }; }
    switch (action.type) {
        case 'Start_Connection':
            return Object.assign({}, state, {
                connectionStatus: false,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            });
        case 'Connection_Change':
            return Object.assign({}, state, {
                connectionStatus: action.connectionStatus
            });
        /*      experimental backchannel support
                case 'Subscribe_Host':
                    return Object.assign({}, state, {
                        host: action.host
                    });
                case 'Unsubscribe_Host':
                    return Object.assign({}, state, {
                        host: undefined
                    });
        */
        default:
            return state;
    }
};
exports.historyReducer = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        input: '',
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null
    }; }
    console.log("history action", action);
    switch (action.type) {
        case 'Update_Input':
            return Object.assign({}, state, {
                input: action.input
            });
        case 'Receive_Sent_Message': {
            var i = state.activities.findIndex(function (activity) {
                return activity.channelData && action.activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId;
            });
            if (i !== -1) {
                var activity = state.activities[i];
                return Object.assign({}, state, {
                    activities: state.activities.slice(0, i).concat([
                        action.activity
                    ], state.activities.slice(i + 1)),
                    selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity
                });
            }
        }
        case 'Receive_Message':
            if (state.activities.find(function (a) { return a.id === action.activity.id; }))
                return state; // don't allow duplicate messages
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    action.activity
                ], state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }))
            });
        case 'Send_Message':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    Object.assign({}, action.activity, {
                        timestamp: (new Date()).toISOString(),
                        channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter }
                    })
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
                input: '',
                clientActivityCounter: state.clientActivityCounter + 1
            });
        case 'Send_Message_Try': {
            var activity_1 = state.activities.find(function (activity) {
                return activity.channelData && activity.channelData.clientActivityId === action.clientActivityId;
            });
            var newActivity = activity_1.id === undefined ? activity_1 : Object.assign({}, activity_1, { id: undefined });
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activityT) { return activityT.type !== "typing" && activityT !== activity_1; }).concat([
                    newActivity
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
                selectedActivity: state.selectedActivity === activity_1 ? newActivity : state.selectedActivity
            });
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            var i = state.activities.findIndex(function (activity) {
                return activity.channelData && activity.channelData.clientActivityId === action.clientActivityId;
            });
            if (i === -1)
                return state;
            var activity = state.activities[i];
            if (activity.id && activity.id != "retry")
                return state;
            var newActivity = Object.assign({}, activity, {
                id: action.type === 'Send_Message_Succeed' ? action.id : null
            });
            return Object.assign({}, state, {
                activities: state.activities.slice(0, i).concat([
                    newActivity
                ], state.activities.slice(i + 1)),
                clientActivityCounter: state.clientActivityCounter + 1,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            });
        }
        case 'Show_Typing':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat(state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }), [
                    action.activity
                ])
            });
        case 'Clear_Typing': {
            var activities = state.activities.filter(function (activity) { return activity.from.id !== action.from.id || activity.type !== "typing"; });
            return Object.assign({}, state, {
                activities: activities,
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
};
exports.createStore = function () {
    return redux_1.createStore(redux_1.combineReducers({
        format: exports.formatReducer,
        connection: exports.connectionReducer,
        history: exports.historyReducer
    }));
};
//# sourceMappingURL=Store.js.map