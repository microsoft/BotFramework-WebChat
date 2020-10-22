import { HostConfig } from 'adaptivecards';
import { Activity, ConnectionStatus, IBotConnection, Message, User } from 'botframework-directlinejs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Strings } from './Strings';
import { ActivityOrID } from './Types';
import { Reducer } from 'redux';
export declare enum ListeningState {
    STOPPED = 0,
    STARTING = 1,
    STARTED = 2,
    STOPPING = 3,
}
export declare const sendMessage: (text: string, from: User, locale: string) => ChatActions;
export declare const sendFiles: (files: FileList, from: User, locale: string) => ChatActions;
export interface ShellState {
    sendTyping: boolean;
    input: string;
    listeningState: ListeningState;
    lastInputViaSpeech: boolean;
}
export declare type ShellAction = {
    type: 'Update_Input';
    input: string;
    source: 'text' | 'speech';
} | {
    type: 'Listening_Starting';
} | {
    type: 'Listening_Start';
} | {
    type: 'Listening_Stopping';
} | {
    type: 'Listening_Stop';
} | {
    type: 'Stop_Speaking';
} | {
    type: 'Card_Action_Clicked';
} | {
    type: 'Set_Send_Typing';
    sendTyping: boolean;
} | {
    type: 'Send_Message';
    activity: Activity;
} | {
    type: 'Speak_SSML';
    ssml: string;
    locale: string;
    autoListenAfterSpeak: boolean;
};
export declare const shell: Reducer<ShellState>;
export interface FormatState {
    chatTitle: boolean | string;
    locale: string;
    showUploadButton: boolean;
    strings: Strings;
    carouselMargin: number;
    botIconUrl: string;
    chatIconColor: string;
    chatIconMessage: string;
    showBrandMessage: boolean;
    brandMessage: string;
    hideHeader: boolean;
}
export declare type FormatAction = {
    type: 'Set_Chat_Title';
    chatTitle: boolean | string;
} | {
    type: 'Set_Locale';
    locale: string;
} | {
    type: 'Set_Measurements';
    carouselMargin: number;
} | {
    type: 'Toggle_Upload_Button';
    showUploadButton: boolean;
} | {
    type: 'Set_BotIcon_Url';
    botIconUrl: string;
} | {
    type: 'Set_ChatIcon_Color';
    chatIconColor: string;
} | {
    type: 'Set_ChatIcon_Message';
    chatIconMessage: string;
} | {
    type: 'Set_HideHeader';
    hideHeader: boolean;
} | {
    type: 'Set_BrandMessage_Status';
    showBrandMessage: boolean;
} | {
    type: 'Set_BrandMessage';
    brandMessage: string;
};
export declare const format: Reducer<FormatState>;
export interface SizeState {
    height: number;
    width: number;
}
export interface SizeAction {
    type: 'Set_Size';
    width: number;
    height: number;
}
export declare const size: Reducer<SizeState>;
export interface WindowState {
    visible: boolean;
}
export interface WindowAction {
    type: 'Set_Status';
    visible: boolean;
}
export declare const windowState: Reducer<WindowState>;
export interface ConnectionState {
    connectionStatus: ConnectionStatus;
    botConnection: IBotConnection;
    selectedActivity: BehaviorSubject<ActivityOrID>;
    user: User;
    bot: User;
}
export declare type ConnectionAction = {
    type: 'Start_Connection';
    botConnection: IBotConnection;
    user: User;
    bot: User;
    selectedActivity: BehaviorSubject<ActivityOrID>;
} | {
    type: 'Connection_Change';
    connectionStatus: ConnectionStatus;
};
export declare const connection: Reducer<ConnectionState>;
export interface HistoryState {
    activities: Activity[];
    clientActivityBase: string;
    clientActivityCounter: number;
    selectedActivity: Activity;
}
export declare type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message' | 'Show_Typing' | 'Receive_Sent_Message';
    activity: Activity;
} | {
    type: 'Send_Message_Try' | 'Send_Message_Fail' | 'Send_Message_Retry';
    clientActivityId: string;
} | {
    type: 'Send_Message_Succeed';
    clientActivityId: string;
    id: string;
} | {
    type: 'Select_Activity';
    selectedActivity: Activity;
} | {
    type: 'Take_SuggestedAction';
    message: Message;
} | {
    type: 'Clear_Typing';
    id: string;
} | {
    type: 'Set_History';
    activities: Activity[];
};
export declare const history: Reducer<HistoryState>;
export interface AdaptiveCardsState {
    hostConfig: HostConfig;
}
export interface AdaptiveCardsAction {
    type: 'Set_AdaptiveCardsHostConfig';
    payload: any;
}
export declare const adaptiveCards: Reducer<AdaptiveCardsState>;
export declare type ChatActions = ShellAction | FormatAction | SizeAction | ConnectionAction | HistoryAction | AdaptiveCardsAction | WindowAction;
export interface ChatState {
    adaptiveCards: AdaptiveCardsState;
    connection: ConnectionState;
    format: FormatState;
    history: HistoryState;
    shell: ShellState;
    size: SizeState;
    windowState: WindowState;
}
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/bindCallback';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';
import { Store } from 'redux';
export declare const createStore: () => Store<ChatState>;
export declare type ChatStore = Store<ChatState>;
