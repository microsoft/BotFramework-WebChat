"use strict";
var redux_1 = require('redux');
var History_1 = require('./History');
var Shell_1 = require('./Shell');
var DebugView_1 = require('./DebugView');
var BotChat_1 = require('./BotChat');
var ConsoleView_1 = require('./ConsoleView');
exports.getStore = function () {
    var global = Function('return this')();
    if (!global['msbotchat'])
        global['msbotchat'] = {};
    if (!global['msbotchat'].store)
        global['msbotchat'].store = redux_1.createStore(redux_1.combineReducers({
            shell: Shell_1.shellReducer,
            connection: BotChat_1.connectionReducer,
            history: History_1.historyReducer,
            debug: DebugView_1.debugReducer,
            console: ConsoleView_1.consoleReducer
        }));
    return global['msbotchat'].store;
};
exports.getState = function () {
    return exports.getStore().getState();
};
//# sourceMappingURL=Store.js.map