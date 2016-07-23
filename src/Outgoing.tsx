import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const Outgoing = (props: {
    outgoingMessage: string,
    updateMessage: (string) => void,
    sendMessage: () => void,
    enableSend: boolean
}) =>
    <div id="outgoingFrame">
        <textarea id="outgoing" value={ props.outgoingMessage } onChange={ e => props.updateMessage(e.target.value) } disabled={ !props.enableSend } />
        <button id="send" onClick={ props.sendMessage } disabled={ !props.outgoingMessage || props.outgoingMessage.length == 0 || !props.enableSend } >send</button>
    </div>;
