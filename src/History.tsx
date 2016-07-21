import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './Message.tsx';

interface Props {
    messages: string[];
}

export class History extends React.Component<Props, {}> {
    render() {
        return <div id="historyFrame">
            { this.props.messages.map((message, index) => <Message key={ index.toString() } text={ message }/>) }
        </div>;
    }
}
