import * as React from 'react';
import { ChatProps } from './Chat';
export declare type AppProps = ChatProps & {
    allowMessagesFrom?: string[];
    onBackchannelMessage: (backchannel: any) => void;
};
export declare class App extends React.Component<AppProps, {}> {
    constructor();
    receiveBackchannelMessageFromHostingPage(event: MessageEvent): void;
    render(): JSX.Element;
}
