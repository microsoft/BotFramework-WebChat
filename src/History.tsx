import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MessageGroup } from './App.tsx';
import { Timestamp } from './Timestamp.tsx';
import { HistoryMessage } from './HistoryMessage.tsx';

export const History = (props: {
    messagegroups: MessageGroup[]
}) =>
    <div id="messageHistoryFrame">
        { props.messagegroups.reverse().map(messagegroup =>
            <div id="messageGroupFrame">
                <Timestamp timestamp={ messagegroup.timestamp } />
                { messagegroup.messages.reverse().map(message =>
                    <HistoryMessage message={ message }/>
                ) }
            </div>
        ) }
    </div>;
