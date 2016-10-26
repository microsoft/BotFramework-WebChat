import * as React from 'react';

export interface SecretOrToken {
    secret?: string,
    token?: string
}

export declare class DirectLine {
    constructor(secretOrToken: SecretOrToken, domain?: string);
}

export interface FormatOptions {
    showHeader?: boolean
}

export interface ChatProps {
    user: { id: string, name: string },
    botConnection: any,
    locale?: string,
    allowMessageSelection?: boolean,
    formatOptions?: FormatOptions
}

export type AppProps = ChatProps & {
    allowMessagesFrom?: string[],
    onBackchannelMessage?: (backchannel: any) => void
}

export declare const App: (props: AppProps) => {};
export declare const Chat: (props: ChatProps) => {};
export declare const DebugView: () => {};
