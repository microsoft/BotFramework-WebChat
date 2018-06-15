import * as React from 'react';
import { Attachment } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { FormatState, SizeState } from './Store';
import { HScroll } from './HScroll';
import { IDoCardAction } from './Chat';
import * as konsole from './Konsole';
import { Gallery } from 'webchat-ui';

export interface CarouselProps {
    format: FormatState,
    size: SizeState,
    attachments: Attachment[],
    onCardAction: IDoCardAction,
    onImageLoad: () => void
}

export class Carousel extends React.PureComponent<CarouselProps, {}> {
    private root: HTMLDivElement;
    private hscroll: HScroll;

    constructor(props: CarouselProps) {
        super(props);
    }

    render() {
        return (
            <div className="wc-carousel" ref={ div => this.root = div } style={{width: 700}}>
              <CarouselAttachments { ... this.props as CarouselAttachmentProps }/>
            </div >
        );
    }
}

export interface CarouselAttachmentProps {
    format: FormatState,
    attachments: Attachment[],
    onCardAction: IDoCardAction,
    onImageLoad: () => void
}

class CarouselAttachments extends React.PureComponent<CarouselAttachmentProps, {}> {
    render() {
        konsole.log("rendering CarouselAttachments");
        const { attachments, onCardAction, ... props } = this.props;
        return (
            <Gallery attachments={ attachments } buttonAction={ onCardAction } />
        );
    }
}
