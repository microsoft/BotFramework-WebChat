import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface Props {
    outgoingMessage: string;
    updateMessage: (string) => void;
    sendMessage: () => void;
    enableSend: boolean;
}

export class Outgoing extends React.Component<Props, {}> {
    render() {
        console.log("rendering outgoing", this.props);
        return <div id="outgoingFrame">
            <textarea id="outgoing" value={ this.props.outgoingMessage } onChange={ e => this.props.updateMessage(e.target.value) } disabled={ !this.props.enableSend } / >
            <button id="send" onClick={ this.props.sendMessage } disabled={ !this.props.outgoingMessage || this.props.outgoingMessage.length == 0 || !this.props.enableSend } >send</button>
        </div>;
    }
}
