"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var redux_1 = require("redux");
var BotConnection_1 = require("./BotConnection");
var Chat_1 = require("./Chat");
var Strings_1 = require("./Strings");
exports.format = function (state, action) {
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
exports.connection = function (state, action) {
    if (state === void 0) { state = {
        connectionStatus: BotConnection_1.ConnectionStatus.Connecting,
        botConnection: undefined,
        selectedActivity: undefined,
        user: undefined,
        bot: undefined
    }; }
    switch (action.type) {
        case 'Start_Connection':
            return __assign({}, state, { botConnection: action.botConnection, user: action.user, bot: action.bot, selectedActivity: action.selectedActivity });
        case 'Connection_Change':
            return __assign({}, state, { connectionStatus: action.connectionStatus });
        default:
            return state;
    }
};
exports.history = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        input: '',
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null
    }; }
    Chat_1.konsole.log("history action", action);
    switch (action.type) {
        case 'Update_Input':
            return __assign({}, state, { input: action.input });
        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            var i = state.activities.findIndex(function (activity) {
                return activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId;
            });
            if (i !== -1) {
                var activity = state.activities[i];
                return __assign({}, state, { activities: state.activities.slice(0, i).concat([
                        action.activity
                    ], state.activities.slice(i + 1)), selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity });
            }
        }
        case 'Receive_Message':
            if (state.activities.find(function (a) { return a.id === action.activity.id; }))
                return state; // don't allow duplicate messages
            return __assign({}, state, { activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    action.activity
                ], state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; })) });
        case 'Send_Message':
            return __assign({}, state, { activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    __assign({}, action.activity, { timestamp: (new Date()).toISOString(), channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter } })
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })), input: '', clientActivityCounter: state.clientActivityCounter + 1 });
        case 'Send_Message_Try': {
            var activity_1 = state.activities.find(function (activity) {
                return activity.channelData && activity.channelData.clientActivityId === action.clientActivityId;
            });
            var newActivity = activity_1.id === undefined ? activity_1 : __assign({}, activity_1, { id: undefined });
            return __assign({}, state, { activities: state.activities.filter(function (activityT) { return activityT.type !== "typing" && activityT !== activity_1; }).concat([
                    newActivity
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })), selectedActivity: state.selectedActivity === activity_1 ? newActivity : state.selectedActivity });
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            var i = state.activities.findIndex(function (activity) {
                return activity.channelData && activity.channelData.clientActivityId === action.clientActivityId;
            });
            if (i === -1)
                return state;
            var activity = state.activities[i];
            if (activity.id != "retry")
                return state;
            var newActivity = __assign({}, activity, { id: action.type === 'Send_Message_Succeed' ? action.id : null });
            return __assign({}, state, { activities: state.activities.slice(0, i).concat([
                    newActivity
                ], state.activities.slice(i + 1)), clientActivityCounter: state.clientActivityCounter + 1, selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        }
        case 'Show_Typing':
            return __assign({}, state, { activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat(state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }), [
                    action.activity
                ]) });
        case 'Clear_Typing':
            return __assign({}, state, { activities: state.activities.filter(function (activity) { return activity.id !== action.id; }), selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity });
        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity)
                return state;
            return __assign({}, state, { selectedActivity: action.selectedActivity });
        default:
            return state;
    }
};
exports.createStore = function () {
    return redux_1.createStore(redux_1.combineReducers({
        format: exports.format,
        connection: exports.connection,
        history: exports.history
    }));
};
//# sourceMappingURL=Store.js.map