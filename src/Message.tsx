import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface MessageProps {
    text: string
}
export class Message extends React.Component<MessageProps, any> {
    render() {
        return <p>{ this.props.text }</p>;
    }
}
