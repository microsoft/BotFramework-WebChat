import * as React from 'react';

export interface SecretOrToken {
    secret?: string,
    token?: string
}

export declare class DirectLine {
    constructor(secretOrToken: SecretOrToken, domain?: string);
}

export declare class DirectLine3 {
    constructor(secretOrToken: SecretOrToken, domain?: string, segment?: string);
    start();
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
