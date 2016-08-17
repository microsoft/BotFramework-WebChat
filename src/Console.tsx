import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConsoleActions } from './App.tsx';

export const Console = (props: {
    actions: ConsoleActions,
    text: string,
    enableSend: boolean
}) =>
    <div className="wc-console">
        <label className="wc-upload">
            <input type="file" accept="image/*" multiple onChange={ e => props.actions.sendFile(e.target.files) } />
            <svg width="26" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M 19.9603965 4.789052 m -2 0 a 2 2 0 0 1 4 0 a 2 2 0 0 1 -4 0 z M 8.3168322 4.1917918 L 2.49505 15.5342575 L 22.455446 15.5342575 L 17.465347 8.5643945 L 14.4158421 11.1780931 L 8.3168322 4.1917918 Z M 1.04 1 L 1.04 17 L 24.96 17 L 24.96 1 L 1.04 1 Z M 1.0352753 0 L 24.9647247 0 C 25.5364915 0 26 0.444957 26 0.9934084 L 26 17.006613 C 26 17.5552514 25.5265266 18 24.9647247 18 L 1.0352753 18 C 0.4635085 18 0 17.5550644 0 17.006613 L 0 0.9934084 C 0 0.44477 0.4734734 0 1.0352753 0 Z" />
            </svg>
        </label>
        <input type="text" autoFocus value={ props.text } onChange={ e => props.actions.updateMessage(e.target.value) } onKeyPress = { e => e.key == 'Enter' ? props.actions.sendMessage() : null } disabled={ !props.enableSend } placeholder="Type your message..." />
        <button onClick={ props.actions.sendMessage } disabled={ !props.text || props.text.length == 0 || !props.enableSend } >send</button>
    </div>;
