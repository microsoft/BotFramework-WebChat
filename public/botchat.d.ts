import * as React from 'react';

export interface SecretOrToken {
    secret?: string,
    token?: string
}

export declare class DirectLine {
    constructor(secretOrToken: SecretOrToken, domain?: string, segment?: string); // segment is DEPRECATED and will be removed before release
    start();
    end();
}

export type DirectLine3 = DirectLine; // DEPRECATED will be removed before release 

export interface FormatOptions {
    showHeader?: boolean
}

export interface User {
    id: string,
    name?: string
}

export interface ChatProps {
    user: User,
    botConnection: any,
    locale?: string,
    selectedActivity?: any,
    formatOptions?: FormatOptions
}

export type AppProps = ChatProps & {
    allowMessagesFrom?: string[],
    onBackchannelMessage?: (backchannel: any) => void
}

export declare const App: (props: AppProps, container: HTMLElement) => void;
export declare const Chat: (props: ChatProps) => JSX.Element;
