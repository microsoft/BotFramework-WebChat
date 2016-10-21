import * as React from 'react';
import { Chat, ChatProps } from './Chat';

export const App = (props: ChatProps) =>
    <div className="wc-app">
        <div className="wc-app-left-container">
            <Chat { ...props } />
        </div>
    </div>;
