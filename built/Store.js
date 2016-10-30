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
exports.historyReducer = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        input: '',
        sendCounter: 0,
        autoscroll: true,
        selectedActivity: null
    }; }
    console.log("history action", action);
    switch (action.type) {
        case 'Update_Input':
            return Object.assign({}, state, {
                input: action.input
            });
        case 'Receive_Message':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    Object.assign({}, action.activity, { status: "received" })
                ], state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }))
            });
        case 'Send_Message':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    Object.assign({}, action.activity, { status: "sending", sendId: state.sendCounter })
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
                input: '',
                sendCounter: state.sendCounter + 1,
                autoscroll: true
            });
        case 'Send_Message_Try':
            var activity = state.activities.find(function (activity) { return activity["sendId"] === action.sendId; });
            return Object.assign({}, state, {
                activities: [
                    state.activities.filter(function (activity) { return activity["sendId"] !== action.sendId && activity.type !== "typing"; }),
                    Object.assign({}, activity, { status: "sending", sendId: state.sendCounter })
                ].concat(state.activities.filter(function (activity) { return activity.type === "typing"; })),
                sendCounter: state.sendCounter + 1,
                autoscroll: true
            });
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail':
            var i = state.activities.findIndex(function (activity) { return activity["sendId"] === action.sendId; });
            if (i === -1)
                return state;
            return Object.assign({}, state, {
                activities: state.activities.slice(0, i).concat([
                    Object.assign({}, state.activities[i], {
                        status: action.type === 'Send_Message_Succeed' ? "sent" : "retry",
                        id: action.type === 'Send_Message_Succeed' ? action.id : undefined
                    })
                ], state.activities.slice(i + 1)),
                sendCounter: state.sendCounter + 1,
                autoscroll: true
            });
        case 'Show_Typing':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat(state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }), [
                    Object.assign({}, action.activity, { status: "received" })
                ])
            });
        case 'Clear_Typing':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.from.id !== action.from.id || activity.type !== "typing"; })
            });
        case 'Set_Autoscroll':
            return Object.assign({}, state, {
                autoscroll: action.autoscroll
            });
        case 'Select_Activity':
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