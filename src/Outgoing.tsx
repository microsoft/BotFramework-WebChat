import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const Outgoing = (props: {
    updateMessage: (string) => void,
    sendMessage: () => void,
    text: string,
    enableSend: boolean
}) =>
    <div id="outgoingFrame">
        <textarea id="outgoing" value={ props.text } onChange={ e => props.updateMessage(e.target.value) } disabled={ !props.enableSend } />
        <button id="send" onClick={ props.sendMessage } disabled={ !props.text || props.text.length == 0 || !props.enableSend } >send</button>
    </div>;
