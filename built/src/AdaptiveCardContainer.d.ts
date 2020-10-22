/// <reference types="react" />
import { AdaptiveCard, HostConfig } from 'adaptivecards';
import { IAdaptiveCard } from 'adaptivecards/lib/schema';
import { CardAction } from 'botframework-directlinejs/built/directLine';
import * as React from 'react';
import { IDoCardAction } from './Chat';
export interface Props {
    className?: string;
    disabled?: boolean;
    hostConfig: HostConfig;
    jsonCard?: IAdaptiveCard;
    nativeCard?: AdaptiveCard;
    onCardAction: IDoCardAction;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    onImageLoad?: () => any;
}
export interface State {
    errors?: string[];
}
export interface BotFrameworkCardAction extends CardAction {
    __isBotFrameworkCardAction: boolean;
}
declare const _default: React.ComponentClass<any>;
export default _default;
