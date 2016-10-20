"use strict";
var redux_1 = require('redux');
exports.shellReducer = function (state, action) {
    if (state === void 0) { state = {
        text: '',
        enableSend: true
    }; }
    switch (action.type) {
        case 'Update_Shell_Text':
            return { text: action.text, enableSend: true };
        case 'Pre_Send_Shell_Text':
            return { text: state.text, enableSend: false };
        case 'Fail_Send_Shell_Text':
            return { text: state.text, enableSend: true };
        case 'Post_Send_Shell_Text':
            return { text: '', enableSend: true };
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
        autoscroll: true,
        selectedActivity: null
    }; }
    switch (action.type) {
        case 'Receive_Message':
            return { activities: state.activities.concat([action.activity]), autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Send_Message':
            return { activities: state.activities.concat([action.activity]), autoscroll: true, selectedActivity: state.selectedActivity };
        case 'Set_Autoscroll':
            return { activities: state.activities, autoscroll: action.autoscroll, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { activities: state.activities, autoscroll: state.autoscroll, selectedActivity: action.selectedActivity };
        default:
            return state;
    }
};
exports.getStore = function () {
    var global = Function('return this')();
    if (!global['msbotchat'])
        global['msbotchat'] = {};
    if (!global['msbotchat'].store)
        global['msbotchat'].store = redux_1.createStore(redux_1.combineReducers({
            shell: exports.shellReducer,
            connection: exports.connectionReducer,
            history: exports.historyReducer
        }));
    return global['msbotchat'].store;
};
exports.getState = function () {
    return exports.getStore().getState();
};
//# sourceMappingURL=Store.js.map