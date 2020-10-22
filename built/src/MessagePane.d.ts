/// <reference types="react" />
import { Message } from 'botframework-directlinejs';
import * as React from 'react';
import { IDoCardAction } from './Chat';
export interface MessagePaneProps {
    activityWithSuggestedActions: Message;
    children: React.ReactNode;
    disabled: boolean;
    doCardAction: IDoCardAction;
    takeSuggestedAction: (message: Message) => any;
}
export declare const MessagePane: React.ComponentClass<any>;
