import * as React from 'react';
import { Attachment } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { FormatState } from './Store';
import { HScroll } from './HScroll';
import { konsole } from './Chat';

export interface CarouselProps {
    format: FormatState,
    attachments: Attachment[],
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}

export interface CarouselState {
    contentWidth: number;
}

export class Carousel extends React.Component<CarouselProps, CarouselState> {
    private root: HTMLDivElement;
    private hscroll: HScroll;

    constructor(props: CarouselProps) {
        super(props);

        this.state = {
            contentWidth: undefined
        };
    }

    checkit() {

        if (this.props.format.carouselMargin != undefined) {
            //after the attachments have been rendered, we can now measure their actual width
            if (this.state.contentWidth == undefined) {
                this.root.style.width = '';
                this.setState({ contentWidth: this.root.offsetWidth });
            } else {
                this.hscroll.manageScrollButtons();
            }
        }
    }

    componentDidMount() {
        konsole.log('carousel componentDidMount');
        this.checkit();
    }

    componentDidUpdate() {
        konsole.log('carousel componentDidUpdate');
        this.checkit();
    }

    componentWillReceiveProps(nextProps: CarouselProps) {
        konsole.log('carousel componentWillReceiveProps');

        if (this.props.format.chatWidth != nextProps.format.chatWidth) {
            //this will invalidate the saved measurement, in componentDidUpdate a new measurement will be triggered
            this.setState({ contentWidth: undefined });
        }
    }

    private getMaxMessageContentWidth() {
        if (this.props.format.chatWidth != undefined && this.props.format.carouselMargin != undefined)
            return this.props.format.chatWidth - this.props.format.carouselMargin;
    }

    render() {
        let style: React.CSSProperties;
        const maxMessageContentWidth = this.getMaxMessageContentWidth();

        if (maxMessageContentWidth && this.state.contentWidth > maxMessageContentWidth) {
            style = { width: maxMessageContentWidth }
        }

        return (
            <div className="wc-carousel" ref={ div => this.root = div } style={ style }>
                <HScroll ref={ hscroll => this.hscroll = hscroll }
                    prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                    nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                >
                    <CarouselAttachments { ... this.props }/>
                </HScroll>
            </div >
        )
    }
}

export interface CarouselAttachmentProps {
    format: FormatState
    attachments: Attachment[]
    onCardAction: (type: string, value: string) => void
    onImageLoad: () => void
}

class CarouselAttachments extends React.Component<CarouselAttachmentProps, {}> {

    componentDidUpdate() {
        console.log('CarouselAttachments componentDidUpdate');
        //this.manageScrollButtons();
    }

    shouldComponentUpdate(nextProps: CarouselAttachmentProps) {
        return this.props.attachments !== this.props.attachments;
    }

    render() {
        const { attachments, ... props } = this.props;
        return (
            <ul>{ this.props.attachments.map((attachment, index) =>
                <li key={ index } className="wc-carousel-item">
                    <AttachmentView attachment={ attachment } { ... props }/>
                </li>
            ) }</ul>
        );
    }
}
