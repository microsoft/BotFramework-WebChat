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
        selectedActivity: undefined,
        user: undefined,
        host: undefined
    }; }
    switch (action.type) {
        case 'Start_Connection':
            return Object.assign({}, state, {
                connected: false,
                botConnection: action.botConnection,
                user: action.user,
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
};
exports.historyReducer = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        input: '',
        sendCounter: 0,
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
                    Object.assign({}, action.activity, {
                        status: "received"
                    })
                ], state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }))
            });
        case 'Send_Message':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
                    Object.assign({}, action.activity, {
                        status: "sending",
                        sendId: state.sendCounter
                    })
                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
                input: '',
                sendCounter: state.sendCounter + 1,
                autoscroll: true
            });
        case 'Send_Message_Try':
            {
                var activity = state.activities.find(function (activity) { return activity["sendId"] === action.sendId; });
                var newActivity = Object.assign({}, activity, {
                    status: "sending",
                    sendId: state.sendCounter
                });
                return Object.assign({}, state, {
                    activities: state.activities.filter(function (activity) { return activity["sendId"] !== action.sendId && activity.type !== "typing"; }).concat([
                        newActivity
                    ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
                    sendCounter: state.sendCounter + 1,
                    autoscroll: true,
                    selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
                });
            }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            var i = state.activities.findIndex(function (activity) { return activity["sendId"] === action.sendId; });
            if (i === -1)
                return state;
            var activity = state.activities[i];
            var newActivity = Object.assign({}, activity, {
                status: action.type === 'Send_Message_Succeed' ? "sent" : "retry",
                id: action.type === 'Send_Message_Succeed' ? action.id : undefined
            });
            return Object.assign({}, state, {
                activities: state.activities.slice(0, i).concat([
                    newActivity
                ], state.activities.slice(i + 1)),
                sendCounter: state.sendCounter + 1,
                autoscroll: true,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            });
        }
        case 'Show_Typing':
            return Object.assign({}, state, {
                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat(state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }), [
                    Object.assign({}, action.activity, {
                        status: "received"
                    })
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