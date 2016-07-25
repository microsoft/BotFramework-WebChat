import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const Console = (props: {
    actions: {
        updateMessage(string): void,
        sendMessage(): void,
        sendFile(string): void
    },
    text: string,
    enableSend: boolean
}) =>
    <div id="outgoingFrame">
        <input type="file" id="imageUpload" accept="image/*" multiple onChange={ e => props.actions.sendFile(e.target.files) } />
        <textarea id="outgoing" value={ props.text } onChange={ e => props.actions.updateMessage(e.target.value) } disabled={ !props.enableSend } />
        <button id="send" onClick={ props.actions.sendMessage } disabled={ !props.text || props.text.length == 0 || !props.enableSend } >send</button>
    </div>;
