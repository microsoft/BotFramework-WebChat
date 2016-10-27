import { Store, Reducer } from 'redux';
import { Activity, IBotConnection, User } from './directLineTypes';
import { FormatOptions } from './Chat';
export interface FormatState {
    options: FormatOptions;
}
export declare type FormatAction = {
    type: 'Set_Format_Options';
    options: FormatOptions;
};
export declare const formatReducer: Reducer<FormatState>;
export interface ShellState {
    text: string;
    enableSend: boolean;
}
export declare type ShellAction = {
    type: 'Update_Shell_Text';
    text: string;
} | {
    type: 'Pre_Send_Shell_Text' | 'Fail_Send_Shell_Text' | 'Post_Send_Shell_Text';
};
export declare const shellReducer: Reducer<ShellState>;
export interface ConnectionState {
    connected: boolean;
    botConnection: IBotConnection;
    user: User;
    host: Window;
}
export declare type ConnectionAction = {
    type: 'Start_Connection';
    botConnection: IBotConnection;
    user: User;
} | {
    type: 'Connected_To_Bot' | 'Unsubscribe_Host';
} | {
    type: 'Subscribe_Host';
    host: Window;
};
export declare const connectionReducer: Reducer<ConnectionState>;
export interface HistoryState {
    activities: Activity[];
    autoscroll: boolean;
    selectedActivity: Activity;
}
export declare type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message';
    activity: Activity;
} | {
    type: 'Set_Autoscroll';
    autoscroll: boolean;
} | {
    type: 'Select_Activity';
    selectedActivity: Activity;
};
export declare const historyReducer: Reducer<HistoryState>;
export interface ChatState {
    format: FormatState;
    shell: ShellState;
    connection: ConnectionState;
    history: HistoryState;
}
export declare const getStore: () => Store<ChatState>;
export declare const getState: () => ChatState;
