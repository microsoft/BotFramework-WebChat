/// <reference types="react" />
import { Activity } from 'botframework-directlinejs';
import * as React from 'react';
import { IDoCardAction } from './Chat';
import { FormatState, SizeState } from './Store';
export interface ActivityViewProps {
    activity: Activity;
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    size: SizeState;
}
export declare class ActivityView extends React.Component<ActivityViewProps, {}> {
    constructor(props: ActivityViewProps);
    shouldComponentUpdate(nextProps: ActivityViewProps): boolean;
    render(): JSX.Element;
}
