import * as React from 'react';

export interface SecretOrToken {
    secret?: string,
    token?: string
}

export class DirectLine {
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

export declare enum Severity {
    log,
    info,
    trace,
    debug,
    warn,
    error
}

export interface LogProvider {
    add(severity: Severity, message: any, ...args: any[]);
    log(message: any, ...args: any[]);
    info(message: any, ...args: any[]);
    trace(message: any, ...args: any[]);
    debug(message: any, ...args: any[]);
    warn(message: any, ...args: any[]);
    error(message: any, ...args: any[]);
}

export declare const App: (props: AppProps) => {};
export declare const Chat: (props: ChatProps) => {};
export declare const DebugView: () => {};
export declare const LogView: () => {};
