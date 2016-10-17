import { Store, createStore, combineReducers } from 'redux';
import { HistoryState, historyReducer } from './History';
import { ShellState, shellReducer } from './Shell';
import { DebugState, debugReducer } from './DebugView';
import { ConnectionState, connectionReducer } from './BotChat';


export interface ChatState {
    shell: ShellState,
    connection: ConnectionState,
    history: HistoryState,
    debug: DebugState
}

export const getStore = (): Store<ChatState> => {
    var global = Function('return this')();
    if (!global['msbotchat'])
        global['msbotchat'] = {};
    if (!global['msbotchat'].store)
        global['msbotchat'].store = createStore(
            combineReducers<ChatState>({
                shell: shellReducer,
                connection: connectionReducer,
                history: historyReducer,
                debug: debugReducer
            }));
    return global['msbotchat'].store;
}

export const getState = () => {
    return getStore().getState();
}
