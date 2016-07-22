import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './App.tsx';
import { HistoryMessage } from './HistoryMessage.tsx';

export const History = (props: {
    messages: Message[]
}) => 
     <div id="historyFrame">
        { props.messages.map((message, index) => <HistoryMessage key={ index.toString() } message={ message }/>) }
    </div>;
