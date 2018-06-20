import * as React from 'react';
import { Attachment, CardAction } from 'botframework-directlinejs';
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
            <div className="wc-carousel" ref={ div => this.root = div }>
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
        const { attachments,  ...props } = this.props;
        const onCardAction = (cardAction: CardAction) => cardAction &&
            ((e: React.MouseEvent<HTMLElement>) => {
            props.onCardAction(cardAction.type, cardAction.value, cardAction.title);
            e.stopPropagation();
        });
        return (
            <Gallery attachments={ attachments } buttonAction={ onCardAction } />
        );
    }
}
