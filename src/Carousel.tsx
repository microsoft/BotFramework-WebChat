import { Attachment } from 'botframework-directlinejs';
import * as React from 'react';
import { AttachmentView } from './Attachment';
import { IDoCardAction } from './Chat';
import { HScroll } from './HScroll';
import * as konsole from './Konsole';
import { FormatState, SizeState } from './Store';

export interface CarouselProps {
    attachments: Attachment[];
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    size: SizeState;
}

export class Carousel extends React.PureComponent<CarouselProps, {}> {
    private root: HTMLDivElement;
    private hscroll: HScroll;

    constructor(props: CarouselProps) {
        super(props);
    }

    private updateContentWidth() {
        // after the attachments have been rendered, we can now measure their actual width
        const width = this.props.size.width - this.props.format.carouselMargin;

        // important: remove any hard styling so that we can measure the natural width
        this.root.style.width = '';

        // now measure the natural offsetWidth
        if (this.root.offsetWidth > width) {
            // the content width is bigger than the space allotted, so we'll clip it to force scrolling
            this.root.style.width = width.toString() + 'px';
            // since we're scrolling, we need to show scroll buttons
            this.hscroll.updateScrollButtons();
        }
    }

    componentDidMount() {
        this.updateContentWidth();
    }

    componentDidUpdate() {
        this.updateContentWidth();
    }

    render() {
        return (
            <div className="wc-carousel" ref={ div => this.root = div }>
                <HScroll ref={ hscroll => this.hscroll = hscroll }
                    prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z"
                    nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                    scrollUnit="item"
                >
                    <CarouselAttachments { ...this.props as CarouselAttachmentProps } />
                </HScroll>
            </div >
        );
    }
}

export interface CarouselAttachmentProps {
    attachments: Attachment[];
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
}

class CarouselAttachments extends React.PureComponent<CarouselAttachmentProps, {}> {
    render() {
        konsole.log('rendering CarouselAttachments');

        const { attachments, ...props } = this.props;

        return (
            <ul>
                {
                    this.props.attachments.map((attachment, index) =>
                        <li
                            className="wc-carousel-item"
                            key={ index }
                        >
                            <AttachmentView
                                attachment={ attachment }
                                disabled={ props.disabled }
                                format={ props.format }
                                onCardAction={ props.onCardAction }
                                onImageLoad={ props.onImageLoad }
                            />
                        </li>
                    )
                }
            </ul>
        );
    }
}
