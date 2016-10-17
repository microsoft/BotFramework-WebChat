import * as React from 'react';

export interface Props {
    user: {
        id: string;
        name: string;
    };
    secret?: string;
    token?: string;
    debug?: string;
    title?: string;
    allowMessagesFrom?: string[];
    directLineDomain?: string;
}

export declare class UI extends React.Component<Props, {}> { }
