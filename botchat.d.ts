import * as React from 'react';

export interface DirectLineOptions {
    secret?: string,
    token?: string
    domain?: string,
    webSocket?: boolean
}

export declare class DirectLine {
    constructor(options: DirectLineOptions);
    activity$: any;         // Observable<Activity>
    connectionStatus$: any; // BehaviorSubject<ConnectionStatus>
    reconnect(conversation: any);
    end();
}

export interface FormatOptions {
    showHeader?: boolean
}

export interface User {
    id: string,
    name?: string
}

export interface ChatProps {
    user: User,
    botConnection?: any,
    directLine?: DirectLineOptions,
    locale?: string,
    selectedActivity?: any,
    formatOptions?: FormatOptions
}

export type AppProps = ChatProps;

export declare const App: (props: AppProps, container: HTMLElement) => void;
export declare class Chat extends React.Component<ChatProps, {}> {}

