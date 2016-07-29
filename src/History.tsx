import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timestamp } from './Timestamp.tsx';
import { MessageGroup } from './App.tsx';
import { HistoryMessage } from './HistoryMessage.tsx';

export const History = (props: {
    messagegroups: MessageGroup[]
}) =>
    <div id="messageHistory">
        { props.messagegroups.map(messagegroup =>
            <div class="messageGroup">
                <Timestamp timestamp={ messagegroup.timestamp } />
                { messagegroup.messages.map(message => <HistoryMessage message={ message }/>) }
            </div>
        ) }
    </div>;
