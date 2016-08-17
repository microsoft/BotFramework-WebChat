import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timestamp } from './Timestamp.tsx';
import { MessageGroup, ButtonActions } from './App.tsx';
import { HistoryMessage } from './HistoryMessage.tsx';

export const History = (props: {
    messagegroups: MessageGroup[],
    buttonActions: ButtonActions
}) =>
    <div className="wc-message-groups">
        { props.messagegroups.map(messagegroup =>
            <div className="wc-message-group">
                <Timestamp timestamp={ messagegroup.timestamp } />
                { messagegroup.messages.map(message => <HistoryMessage message={ message } buttonActions={ props.buttonActions }/>) }
            </div>
        ) }
    </div>;
