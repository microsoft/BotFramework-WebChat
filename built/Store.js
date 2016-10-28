"use strict";
var redux_1 = require('redux');
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
        connected: false,
        botConnection: undefined,
        user: undefined,
        host: undefined
    }; }
    switch (action.type) {
        case 'Start_Connection':
            return { connected: false, botConnection: action.botConnection, user: action.user, host: state.host };
        case 'Connected_To_Bot':
            return { connected: true, botConnection: state.botConnection, user: state.user, host: state.host };
        case 'Subscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: action.host };
        case 'Unsubscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: undefined };
        default:
            return state;
    }
};
var patch = function (a, i, o) { return a.slice(0, i).concat([
    Object.assign({}, a[i], o)
], a.slice(i + 1)); };
var activityStatus = {
    'Send_Message_Try': "sending",
    'Send_Message_Succeed': "sent",
    'Send_Message_Fail': "retry"
};
exports.historyReducer = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        input: '',
        sendCounter: 0,
        autoscroll: true,
        selectedActivity: null
    }; }
    switch (action.type) {
        case 'Update_Input':
            return { activities: state.activities, input: action.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Receive_Message':
            return { activities: state.activities.concat([Object.assign({}, action.activity, { status: "received" })]), input: state.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Send_Message':
            return { activities: state.activities.concat([Object.assign({}, action.activity, { status: "sending", sendId: state.sendCounter })]), input: '', sendCounter: state.sendCounter + 1, autoscroll: true, selectedActivity: state.selectedActivity };
        case 'Send_Message_Try':
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail':
            var i = state.activities.findIndex(function (activity) { return activity["sendId"] === action.sendId; });
            if (i === -1)
                return state;
            return {
                activities: patch(state.activities, i, {
                    status: activityStatus[action.type],
                    id: action.type === 'Send_Message_Succeed' ? action.id : undefined
                }),
                input: state.input, sendCounter: state.sendCounter + 1, autoscroll: true, selectedActivity: state.selectedActivity
            };
        case 'Set_Autoscroll':
            return { activities: state.activities, input: state.input, sendCounter: state.sendCounter, autoscroll: action.autoscroll, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { activities: state.activities, input: state.input, sendCounter: state.sendCounter, autoscroll: state.autoscroll, selectedActivity: action.selectedActivity };
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