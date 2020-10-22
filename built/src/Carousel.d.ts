/// <reference types="react" />
import { Attachment } from 'botframework-directlinejs';
import * as React from 'react';
import { IDoCardAction } from './Chat';
import { FormatState, SizeState } from './Store';
export interface CarouselProps {
    attachments: Attachment[];
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    size: SizeState;
}
export declare class Carousel extends React.PureComponent<CarouselProps, {}> {
    private root;
    private hscroll;
    constructor(props: CarouselProps);
    private updateContentWidth();
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
}
export interface CarouselAttachmentProps {
    attachments: Attachment[];
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
}
