import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface Props {
    sendMessage: (string) => void;
}

export class Outgoing extends React.Component<Props, {}> {
    _outgoing: any;

    onClickSend = () =>
        this.props.sendMessage(this._outgoing.value);

    render() {
        return <div id="outgoingFrame">
            <textarea id="outgoing" ref={ outgoing => this._outgoing = outgoing }/ >
            <button id="send" onClick={ this.onClickSend }>send</button>
        </div>;
    }
}
