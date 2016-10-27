import * as React from 'react';
import { IBotConnection } from './directLineTypes';
export interface FormatOptions {
    showHeader?: boolean;
}
export interface ChatProps {
    user: {
        id: string;
        name: string;
    };
    botConnection: IBotConnection;
    locale?: string;
    allowMessageSelection?: boolean;
    formatOptions?: FormatOptions;
}
export declare class Chat extends React.Component<ChatProps, {}> {
    constructor();
    render(): JSX.Element;
}
