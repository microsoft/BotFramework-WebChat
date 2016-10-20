import * as React from 'react';

export declare class DebugView extends React.Component<{}, {}> {
}

export interface UIProps {
    devConsole?: IConsoleProvider;
    user: {
        id: string;
        name: string;
    };
    secret?: string;
    token?: string;
    title?: string;
    allowMessagesFrom?: string[];
    directLineDomain?: string;
    allowMessageSelection: boolean;
}
export declare class UI extends React.Component<UIProps, {}> {
}

export interface AppProps {
    uiProps: UIProps;
}
export declare class App extends React.Component<AppProps, {}> {
}

export declare enum EntryType {
    info = 0,
    trace = 1,
    debug = 2,
    warn = 3,
    error = 4,
}
export interface IConsoleEntry {
    entryType?: EntryType;
    message?: any;
    args?: any[];
}
export interface IConsoleProvider {
    log: (message: any, ...args: any[]) => void;
    info: (message: any, ...args: any[]) => void;
    trace: (message: any, ...args: any[]) => void;
    debug: (message: any, ...args: any[]) => void;
    warn: (message: any, ...args: any[]) => void;
    error: (message: any, ...args: any[]) => void;
}
export declare class BuiltinConsoleProvider implements IConsoleProvider {
    log: (message: any, ...args: any[]) => void;
    info: (message: any, ...args: any[]) => void;
    trace: (message: any, ...args: any[]) => void;
    debug: (message: any, ...args: any[]) => void;
    warn: (message: any, ...args: any[]) => void;
    error: (message: any, ...args: any[]) => void;
}
export declare class NullConsoleProvider implements IConsoleProvider {
    log: (message: any, ...args: any[]) => void;
    info: (message: any, ...args: any[]) => void;
    trace: (message: any, ...args: any[]) => void;
    debug: (message: any, ...args: any[]) => void;
    warn: (message: any, ...args: any[]) => void;
    error: (message: any, ...args: any[]) => void;
}

export interface ConsoleState {
    autoscroll: boolean;
}
export declare class ConsoleProvider implements IConsoleProvider {
    log: (message: any, ...args: any[]) => void;
    info: (message: any, ...args: any[]) => void;
    trace: (message: any, ...args: any[]) => void;
    debug: (message: any, ...args: any[]) => void;
    warn: (message: any, ...args: any[]) => void;
    error: (message: any, ...args: any[]) => void;
}
export interface IConsoleViewState {
    entries: IConsoleEntry[];
}
export declare class ConsoleView extends React.Component<{}, IConsoleViewState> {
}
