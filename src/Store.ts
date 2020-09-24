import { HostConfig } from 'adaptivecards';
import { Activity, ConnectionStatus, IBotConnection, Media, MediaType, Message, User } from 'botframework-directlinejs';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as konsole from './Konsole';
import { Speech } from './SpeechModule';
import { defaultStrings, strings, Strings } from './Strings';
import { ActivityOrID, FormatOptions } from './Types';

// Reducers - perform state transformations

import { Reducer } from 'redux';

export enum ListeningState {
    STOPPED,
    STARTING,
    STARTED,
    STOPPING
}

export const sendMessage = (text: string, from: User, locale: string) => ({
    type: 'Send_Message',
    activity: {
        type: 'message',
        text,
        from,
        locale,
        textFormat: 'plain',
        timestamp: (new Date()).toISOString()
    }} as ChatActions);

export const addMessageToConversation = (id: string, message: string, senderType: string, conversationId: string) => ({
    type: 'Add_Message_To_Conversation',
    conversation_id: conversationId,
    message: {
        id,
        message,
        sender_type: senderType
    }
} as ChatActions);

export const sendFiles = (files: FileList, from: User, locale: string) => ({
    type: 'Send_Message',
    activity: {
        type: 'message',
        attachments: attachmentsFromFiles(files),
        from,
        locale
    }} as ChatActions);

const attachmentsFromFiles = (files: FileList) => {
    const attachments: Media[] = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type as MediaType,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
};

export interface ShellState {
    sendTyping: boolean;
    input: string;
    placeholder: string;
    listeningState: ListeningState;
    lastInputViaSpeech: boolean;
    inputDisabled: boolean;
}

export type ShellAction = {
    type: 'Update_Input',
    input?: string
    disable?: boolean
    placeholder?: string;
    source: 'text' | 'speech'
} | {
    type: 'Listening_Starting'
} | {
    type: 'Listening_Start'
} | {
    type: 'Listening_Stopping'
} | {
    type: 'Listening_Stop'
} | {
    type: 'Stop_Speaking'
} |  {
    type: 'Card_Action_Clicked'
} | {
    type: 'Set_Send_Typing',
    sendTyping: boolean
} | {
    type: 'Send_Message',
    activity: Activity
}| {
    type: 'Speak_SSML',
    ssml: string,
    locale: string
    autoListenAfterSpeak: boolean
}| {
    type: 'Select_Date',
    date: string
}| {
    type: 'Submit_Date',
    message: MessageWithDate
}|  {
    type: 'Select_File',
    payload: boolean
} | {
    type: 'Choose_Option',
    placeholder: string
};

export const shell: Reducer<ShellState> = (
    state: ShellState = {
        input: '',
        sendTyping: false,
        listeningState: ListeningState.STOPPED,
        lastInputViaSpeech : false,
        inputDisabled: false,
        placeholder: defaultStrings.consolePlaceholder
    },
    action: ShellAction
) => {
    switch (action.type) {

        case 'Update_Input':
            return {
                ...state,
                input: action.input != null ? action.input : state.input,
                lastInputViaSpeech : action.source === 'speech',
                placeholder: action.placeholder !== null ? action.placeholder : defaultStrings.consolePlaceholder,
                inputDisabled: action.disable !== null ?  action.disable : state.inputDisabled
            };

        case 'Listening_Start':
            return {
                ...state,
                listeningState: ListeningState.STARTED
            };

        case 'Listening_Stop':
            return {
                ...state,
                listeningState: ListeningState.STOPPED
            };

        case 'Listening_Starting':
            return {
                ...state,
                listeningState: ListeningState.STARTING
            };

        case 'Listening_Stopping':
            return {
                ...state,
                listeningState: ListeningState.STOPPING
            };

        case 'Send_Message':
            return {
                ...state,
                input: ''
            };

        case 'Set_Send_Typing':
            return {
                ...state,
                sendTyping: action.sendTyping
            };

        case 'Card_Action_Clicked':
           return {
                ...state,
                lastInputViaSpeech : false
           };

        case 'Select_Date':
            return {
                ...state,
                inputDisabled: true,
                lastInputViaSpeech: false,
                input: '',
                placeholder: 'Press enter to submit selected date'
            };

        case 'Submit_Date':
            return {
                ...state,
                inputDisabled: false,
                placeholder: defaultStrings.consolePlaceholder
            };

        case 'Select_File':
            return {
                ...state,
                inputDisabled: action.payload
            };

        case 'Choose_Option':
            return {
                ...state,
                inputDisabled: true,
                placeholder: action.placeholder
            };

        default:
            return state;
    }
};

export interface FormatState {
    chatTitle: boolean | string;
    locale: string;
    showUploadButton: boolean;
    strings: Strings;
    carouselMargin: number;
    themeColor: string;
    logoUrl: string;
    widgetUrl: string;
    widgetSameAsLogo: boolean;
    bottomOffset: number;
    topOffset: number;
    rightOffset: number;
    fullHeight: boolean;
    display_name: string;
}

export type FormatAction = {
    type: 'Set_Chat_Title',
    chatTitle: boolean | string
} | {
    type: 'Set_Locale',
    locale: string
} | {
    type: 'Set_Measurements',
    carouselMargin: number
} | {
    type: 'Toggle_Upload_Button',
    showUploadButton: boolean
} | {
    type: 'Set_Theme_Color',
    themeColor: string
} | {
    type: 'Set_Logo_Img',
    logoUrl: string
} | {
    type: 'Set_Format_Options',
    formatOptions: FormatOptions
};

export const format: Reducer<FormatState> = (
    state: FormatState = {
        chatTitle: true,
        locale: 'en-us',
        showUploadButton: false,
        strings: defaultStrings,
        carouselMargin: undefined,
        themeColor: undefined,
        logoUrl: undefined,
        widgetUrl: undefined,
        widgetSameAsLogo: false,
        bottomOffset: undefined,
        topOffset: undefined,
        rightOffset: undefined,
        fullHeight: false,
        display_name: undefined
    },
    action: FormatAction
) => {
    switch (action.type) {
        case 'Set_Chat_Title':
            return {
                ...state,
                chatTitle: typeof action.chatTitle === 'undefined' ? true : action.chatTitle
            };
        case 'Set_Locale':
            return {
                ...state,
                locale: action.locale,
                strings: strings(action.locale)
            };
        case 'Set_Measurements':
            return {
                ...state,
                carouselMargin: action.carouselMargin
            };
        case 'Toggle_Upload_Button':
            return {
                ...state,
                showUploadButton: action.showUploadButton
            };
        case 'Set_Theme_Color':
            return {
                ...state,
                themeColor: action.themeColor
            };
        case 'Set_Logo_Img':
            return {
                ...state,
                logoUrl: action.logoUrl
            };
        case 'Set_Format_Options':
            return {
                ...state,
                ...action.formatOptions
            };
        default:
            return state;
    }
};

export interface SizeState {
    height: number;
    width: number;
}

export interface SizeAction {
    type: 'Set_Size';
    width: number;
    height: number;
}

export const size: Reducer<SizeState> = (
    state: SizeState = {
        width: undefined,
        height: undefined
    },
    action: SizeAction
) => {
    switch (action.type) {
        case 'Set_Size':
            return {
                ...state,
                width: action.width,
                height: action.height
            };
        default:
            return state;
    }
};

export interface Verification {
    attempted?: boolean;
    status?: number;
}

export interface ConnectionState {
    connectionStatus: ConnectionStatus;
    botConnection: IBotConnection & { conversationId?: string };
    selectedActivity: BehaviorSubject<ActivityOrID>;
    user: User;
    bot: User;
    verification: Verification;
}

export type ConnectionAction = {
    type: 'Start_Connection',
    botConnection: IBotConnection,
    user: User,
    bot: User,
    selectedActivity: BehaviorSubject<ActivityOrID>
} | {
    type: 'Connection_Change',
    connectionStatus: ConnectionStatus
} | {
    type: 'Set_Verification',
    verification: Verification;
    user: User;
};

export const connection: Reducer<ConnectionState> = (
    state: ConnectionState = {
        connectionStatus: ConnectionStatus.Uninitialized,
        botConnection: undefined,
        selectedActivity: undefined,
        user: undefined,
        bot: undefined,
        verification: {
            attempted: false,
            status: 0
        }
    },
    action: ConnectionAction
) => {
    switch (action.type) {
        case 'Start_Connection':
            return {
                ...state,
                botConnection: action.botConnection,
                user: action.user,
                bot: action.bot,
                selectedActivity: action.selectedActivity
            };
        case 'Set_Verification':
            return {
                ...state,
                verification: action.verification,
                user: action.user
            };
        case 'Connection_Change':
            return {
                ...state,
                connectionStatus: action.connectionStatus
            };
        default:
            return state;
    }
};

export interface HistoryState {
    activities: Activity[];
    clientActivityBase: string;
    clientActivityCounter: number;
    selectedActivity: Activity;
    selectedDisclaimerActivity: Activity;
}

export interface ConversationState {
    conversations: Conversation[];
    selectedConversation?: Conversation;
    botId: string;
    organizationId: string;
}

export interface Conversation {
    id: string;
    msft_conversation_id: string;
    status: string;
    updated_at: string;
    conversation_messages: any[];
}

export type ConversationAction = {
    type: 'Set_Conversations';
    conversations: Conversation[];
} | {
    type: 'Set_Selected_Conversation';
    conversation: Conversation;
} | {
    type: 'Set_Conversation_Ids';
    botId: string;
    organizationId: string;
} | {
    type: 'Add_Message_To_Conversation';
    conversation_id: string;
    message: any;
} | {
    type: 'Add_Conversation';
    conversation: Conversation;
};

export type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message' | 'Show_Typing' | 'Receive_Sent_Message'
    activity: Activity
} | {
    type: 'Set_Messages',
    activities: Activity[]
} | {
    type: 'Send_Message_Try' | 'Send_Message_Fail' | 'Send_Message_Retry',
    clientActivityId: string
} | {
    type: 'Send_Message_Succeed'
    clientActivityId: string
    id: string
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
} | {
    type: 'Take_SuggestedAction',
    message: Message
} | {
    type: 'Clear_Typing',
    id: string
};

const copyArrayWithUpdatedItem = <T>(array: T[], i: number, item: T) => [
    ...array.slice(0, i),
    item,
    ...array.slice(i + 1)
];

export const conversations: Reducer<ConversationState> = (
    state: ConversationState = {
        conversations: [],
        selectedConversation: null,
        botId: null,
        organizationId: null
    },
    action: ConversationAction
) => {
    switch (action.type) {
        case 'Set_Conversations': {
            return {
                ...state,
                conversations: action.conversations
            };
        }
        case 'Set_Selected_Conversation': {
            return {
                ...state,
                selectedConversation: action.conversation
            };
        }
        case 'Set_Conversation_Ids': {
            return {
                ...state,
                botId: action.botId,
                organizationId: action.organizationId
            };
        }
        case 'Add_Message_To_Conversation': {
            const conversation = state.conversations.find((conversation: Conversation) => conversation.msft_conversation_id === action.conversation_id);
            const updatedConversations = state.conversations.filter((conversation: Conversation) => conversation.msft_conversation_id !== action.conversation_id);
            const now = moment().format();
            return {
                ...state,
                conversations: [
                    {
                        ...conversation,
                        conversation_messages: [
                            ...conversation.conversation_messages,
                            action.message
                        ],
                        updated_at: now
                    },
                    ...updatedConversations
                ]
            };
        }
        case 'Add_Conversation': {
            return {
                ...state,
                conversations: [
                    ...state.conversations,
                    {
                        ...action.conversation,
                        conversation_messages: []
                    }
                ]
            };
        }
        default:
            return state;
    }
};

export const history: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
        clientActivityCounter: 0,
        selectedActivity: null,
        selectedDisclaimerActivity: null
    },
    action: HistoryAction
) => {
    switch (action.type) {
        case 'Set_Messages': {
            return {
                ...state,
                activities: action.activities
            };
        }

        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId
            );
            if (i !== -1) {
                const activity = state.activities[i];

                return {
                    ...state,
                    activities: copyArrayWithUpdatedItem(state.activities, i, activity),
                    selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity
                };
            }
            // else fall through and treat this as a new message
        }

        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id)) { return state; } // don't allow duplicate messages

            const copy: any = action.activity;
            const isDisclaimer = copy && copy.entities && copy.entities.length > 0 && copy.entities[0].node_type === 'disclaimer';

            return {
                ...state,
                activities: [
                    ...state.activities.filter(activity => activity.type !== 'typing'),
                    action.activity,
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === 'typing')
                ],
                selectedDisclaimerActivity: isDisclaimer ? action.activity : null
            };

        case 'Send_Message':
            return {
                ...state,
                activities: [
                    ...state.activities.filter(activity => activity.type !== 'typing'),
                    {
                        ...action.activity,
                        timestamp: (new Date()).toISOString(),
                        channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter }
                    },
                    ...state.activities.filter(activity => activity.type === 'typing')
                ],
                clientActivityCounter: state.clientActivityCounter + 1
            };

        case 'Send_Message_Retry': {
            const activity = state.activities.find(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            const newActivity = activity.id === undefined ? activity : { ...activity, id: undefined };
            return {
                ...state,
                activities: [
                    ...state.activities.filter(activityT => activityT.type !== 'typing' && activityT !== activity),
                    newActivity,
                    ...state.activities.filter(activity => activity.type === 'typing')
                ],
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity =>
                activity.channelData && activity.channelData.clientActivityId === action.clientActivityId
            );
            if (i === -1) { return state; }

            const activity = state.activities[i];
            if (activity.id && activity.id !== 'retry') { return state; }

            const newActivity = {
                ...activity,
                id: action.type === 'Send_Message_Succeed' ? action.id : null
            };
            return {
                ...state,
                activities: copyArrayWithUpdatedItem(state.activities, i, newActivity),
                clientActivityCounter: state.clientActivityCounter + 1,
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };
        }
        case 'Show_Typing':
            return {
                ...state,
                activities: [
                    ...state.activities.filter(activity => activity.type !== 'typing'),
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === 'typing'),
                    action.activity
                ]
            };

        case 'Clear_Typing':
            return {
                ...state,
                activities: state.activities.filter(activity => activity.id !== action.id),
                selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity
            };

        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity) { return state; }
            return {
                ...state,
                selectedActivity: action.selectedActivity
            };

        case 'Take_SuggestedAction':
            const i = state.activities.findIndex(activity => activity === action.message);
            const activity = state.activities[i];
            const newActivity = {
                ...activity,
                suggestedActions: undefined
            };
            return {
                ...state,
                activities: copyArrayWithUpdatedItem(state.activities, i, newActivity),
                selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity
            };

        default:
            return state;
    }
};

export interface AdaptiveCardsState {
    hostConfig: HostConfig;
}

export interface AdaptiveCardsAction {
    type: 'Set_AdaptiveCardsHostConfig';
    payload: any;
}

export const adaptiveCards: Reducer<AdaptiveCardsState> = (
    state: AdaptiveCardsState = {
        hostConfig: null
    },
    action: AdaptiveCardsAction
) => {
    switch (action.type) {
        case 'Set_AdaptiveCardsHostConfig':
            return {
                ...state,
                hostConfig: action.payload && (action.payload instanceof HostConfig ? action.payload : new HostConfig(action.payload))
            };

        default:
            return state;
    }
};

export type ChatActions = ShellAction | FormatAction | SizeAction | ConnectionAction | HistoryAction | AdaptiveCardsAction | ConversationAction;

const nullAction = { type: null } as ChatActions;

export interface ChatState {
    adaptiveCards: AdaptiveCardsState;
    connection: ConnectionState;
    format: FormatState;
    history: HistoryState;
    shell: ShellState;
    size: SizeState;
    conversations: ConversationState;
}

const speakFromMsg = (msg: Message, fallbackLocale: string) => {
    let speak = msg.speak;

    if (!speak && msg.textFormat == null || msg.textFormat === 'plain') {
        speak = msg.text;
    }
    if (!speak && msg.channelData && msg.channelData.speechOutput && msg.channelData.speechOutput.speakText) {
        speak = msg.channelData.speechOutput.speakText;
    }
    if (!speak && msg.attachments && msg.attachments.length > 0) {
        for (let i = 0; i < msg.attachments.length; i++) {
            const anymsg = msg as any;
            if (anymsg.attachments[i].content && anymsg.attachments[i].content.speak) {
                speak = anymsg.attachments[i].content.speak;
                break;
            }
        }
    }

    return {
        type : 'Speak_SSML',
        ssml: speak,
        locale: msg.locale || fallbackLocale,
        autoListenAfterSpeak : (msg.inputHint === 'expectingInput') || (msg.channelData && msg.channelData.botState === 'WaitingForAnswerToQuestion')
    };
};

// Epics - chain actions together with async operations

import { applyMiddleware } from 'redux';
import { Epic } from 'redux-observable';
import { Observable } from 'rxjs/Observable';

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

const sendMessageEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Send_Message')
    .map(action => {
        const state = store.getState();
        const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
        return ({ type: 'Send_Message_Try', clientActivityId } as HistoryAction);
    });

const trySendMessageEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Send_Message_Try')
    .flatMap(action => {
        const state = store.getState();
        const clientActivityId = action.clientActivityId;
        const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
        if (!activity) {
            konsole.log('trySendMessage: activity not found');
            return Observable.empty<HistoryAction>();
        }

        if (state.history.clientActivityCounter === 1) {
            const capabilities = {
                type: 'ClientCapabilities',
                requiresBotState: true,
                supportsTts: true,
                supportsListening: true
                // Todo: consider implementing acknowledgesTts: true
            };
            (activity as any).entities = (activity as any).entities == null ? [capabilities] :  [...(activity as any).entities, capabilities];
        }

        return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: 'Send_Message_Succeed', clientActivityId, id } as HistoryAction))
        .catch(error => Observable.of({ type: 'Send_Message_Fail', clientActivityId } as HistoryAction));
    });

const speakObservable = Observable.bindCallback<string, string, {}, {}>(Speech.SpeechSynthesizer.speak);

const speakSSMLEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Speak_SSML')
    .filter(action => action.ssml )
    .mergeMap(action => {

        let onSpeakingStarted = null;
        let onSpeakingFinished = () => nullAction;
        if (action.autoListenAfterSpeak) {
            onSpeakingStarted = () => Speech.SpeechRecognizer.warmup() ;
            onSpeakingFinished = () => ({ type: 'Listening_Starting' } as ShellAction);
        }

        const call$ = speakObservable(action.ssml, action.locale, onSpeakingStarted);
        return call$.map(onSpeakingFinished)
            .catch(error => Observable.of(nullAction));
    })
    .merge(action$.ofType('Speak_SSML').map(_ => ({ type: 'Listening_Stopping' } as ShellAction)));

const speakOnMessageReceivedEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Receive_Message')
    .filter(action => (action.activity as Message) && store.getState().shell.lastInputViaSpeech)
    .map(action => speakFromMsg(action.activity as Message, store.getState().format.locale) as ShellAction);

const stopSpeakingEpic: Epic<ChatActions, ChatState> = action$ =>
    action$.ofType(
        'Update_Input',
        'Listening_Starting',
        'Send_Message',
        'Card_Action_Clicked',
        'Stop_Speaking'
    )
    .do(Speech.SpeechSynthesizer.stopSpeaking)
    .map(_ => nullAction);

const stopListeningEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType(
        'Listening_Stopping',
        'Card_Action_Clicked'
    )
    .do(async () => {
        await Speech.SpeechRecognizer.stopRecognizing();

        store.dispatch({ type: 'Listening_Stop' });
    })
    .map(_ => nullAction);

const startListeningEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Listening_Starting')
    .do(async (action: ShellAction) => {
        const { history: { activities }, format: { locale } } = store.getState();
        const lastMessageActivity = [...activities].reverse().find(activity => activity.type === 'message');
        // TODO: Bump DirectLineJS version to support "listenFor" grammars
        const grammars: string[] = lastMessageActivity && (lastMessageActivity as any).listenFor;
        const onIntermediateResult = (srText: string) => { store.dispatch({ type: 'Update_Input', input: srText, source: 'speech' }); };
        const onFinalResult = (srText: string) => {
            srText = srText.replace(/^[.\s]+|[.\s]+$/g, '');
            onIntermediateResult(srText);
            store.dispatch({ type: 'Listening_Stopping' });
            store.dispatch(sendMessage(srText, store.getState().connection.user, locale));
        };
        const onAudioStreamStart = () => { store.dispatch({ type: 'Listening_Start' }); };
        const onRecognitionFailed = () => { store.dispatch({ type: 'Listening_Stopping' }); };

        await Speech.SpeechRecognizer.startRecognizing(
            locale,
            grammars,
            onIntermediateResult,
            onFinalResult,
            onAudioStreamStart,
            onRecognitionFailed
        );
    })
    .map(_ => nullAction);

const listeningSilenceTimeoutEpic: Epic<ChatActions, ChatState> = (action$, store) => {
    const cancelMessages$ = action$.ofType('Update_Input', 'Listening_Stopping');
    return action$.ofType('Listening_Start')
        .mergeMap(action =>
            Observable.of(({ type: 'Listening_Stopping' }) as ShellAction)
            .delay(5000)
            .takeUntil(cancelMessages$));
};

const retrySendMessageEpic: Epic<ChatActions, ChatState> = action$ =>
    action$.ofType('Send_Message_Retry')
    .map(action => ({ type: 'Send_Message_Try', clientActivityId: action.clientActivityId } as HistoryAction));

const updateSelectedActivityEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType(
        'Send_Message_Succeed',
        'Send_Message_Fail',
        'Show_Typing',
        'Clear_Typing'
    )
    .map(action => {
        const state = store.getState();
        if (state.connection.selectedActivity) {
            state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
        }
        return nullAction;
    });

const showTypingEpic: Epic<ChatActions, ChatState> = action$ =>
    action$.ofType('Show_Typing')
    .delay(3000)
    .map(action => ({ type: 'Clear_Typing', id: action.activity.id } as HistoryAction));

const sendTypingEpic: Epic<ChatActions, ChatState> = (action$, store) =>
    action$.ofType('Update_Input')
    .map(_ => store.getState())
    .filter(state => state.shell.sendTyping)
    .throttleTime(3000)
    .do(_ => konsole.log('sending typing'))
    .flatMap(state =>
        state.connection.botConnection.postActivity({
            type: 'typing',
            from: state.connection.user
        })
        .map(_ => nullAction)
        .catch(error => Observable.of(nullAction))
    );

// Now we put it all together into a store with middleware

import { attempt } from 'bluebird';
import { combineReducers, createStore as reduxCreateStore, Store } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { MessageWithDate } from './DatePickerCard';

export const createStore = () =>
    reduxCreateStore(
        combineReducers<ChatState>({
            adaptiveCards,
            connection,
            format,
            history,
            shell,
            size,
            conversations
        }),
        applyMiddleware(createEpicMiddleware(combineEpics(
            updateSelectedActivityEpic,
            sendMessageEpic,
            trySendMessageEpic,
            retrySendMessageEpic,
            showTypingEpic,
            sendTypingEpic,
            speakSSMLEpic,
            speakOnMessageReceivedEpic,
            startListeningEpic,
            stopListeningEpic,
            stopSpeakingEpic,
            listeningSilenceTimeoutEpic
        )))
    );

export type ChatStore = Store<ChatState>;
