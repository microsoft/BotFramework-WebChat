import * as React from 'react';
import { Attachment } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { FormatState } from './Store';

interface CarouselProps {
    format: FormatState,
    attachments: Attachment[],
    onCardAction: (type: string, value: string) => void,
    onImageLoad: ()=> void
}

interface CarouselState {
    contentWidth: number;
    previousButtonEnabled: boolean;
    nextButtonEnabled: boolean;
}

export class Carousel extends React.Component<CarouselProps, Partial<CarouselState>> {
    private root: HTMLDivElement;
    private scrollDiv: HTMLDivElement;
    private scrollStartTimer: number;
    private scrollSyncTimer: number;
    private scrollDurationTimer: number;
    private animateDiv: HTMLDivElement;
    private scrollEventListener =() => this.onScroll();
    private scrollAllowInterrupt = true;

    constructor(props: CarouselProps) {
        super(props);

        this.state = {
            contentWidth: null,
            previousButtonEnabled: false,
            nextButtonEnabled: false
        };
    }

    private clearScrollTimers() {
        clearInterval(this.scrollStartTimer);
        clearInterval(this.scrollSyncTimer);
        clearTimeout(this.scrollDurationTimer);

        document.body.removeChild(this.animateDiv);

        this.animateDiv = null;
        this.scrollStartTimer = null;
        this.scrollSyncTimer = null;
        this.scrollDurationTimer = null;
        this.scrollAllowInterrupt = true;
    }

    private getScrollButtonState(maxScrollLeft: number): Partial<CarouselState> {
        const previousEnabled = this.scrollDiv.scrollLeft > 0;
        const nextEnabled = this.scrollDiv.scrollLeft < maxScrollLeft;

        return {
            previousButtonEnabled: previousEnabled,
            nextButtonEnabled: nextEnabled
        };
    }

    private manageScrollButtons() {
        const newState = this.getScrollButtonState(this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);
        this.setState(newState);
    }

    componentDidMount() {
        this.manageScrollButtons();

        this.scrollDiv.addEventListener('scroll', this.scrollEventListener);

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
    }

    componentDidUpdate() {
        //after the attachments have been rendered, we can now measure their actual width
        if (this.props.format.maxMessageContentWidth && !this.state.contentWidth) {

            this.root.style.width = '';
            var actualContentWidth = this.root.offsetWidth;

            const newState = this.getScrollButtonState(this.props.format.maxMessageContentWidth);
            newState.contentWidth = actualContentWidth;

            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps: CarouselProps) {
        if (this.props.format.maxMessageContentWidth != nextProps.format.maxMessageContentWidth) {
            this.setState({ contentWidth: null });
        }
    }

    componentWillUnmount() {
        this.scrollDiv.removeEventListener('scroll', this.scrollEventListener);
    }

    private onScroll() {
        this.manageScrollButtons();
    }

    private scrollBy(increment: number) {

        if (!this.scrollAllowInterrupt) return;

        let easingClassName = 'wc-animate-scroll';

        //cancel existing animation when clicking fast
        if (this.animateDiv) {
            easingClassName = 'wc-animate-scroll-rapid';
            this.clearScrollTimers();
        }

        //the width of the li is measured on demand in case CSS has resized it
        const firstItem = this.scrollDiv.querySelector('.wc-carousel-item') as HTMLElement;
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth;
        const unit = increment * itemWidth;
        const scrollLeft = this.scrollDiv.scrollLeft;
        let dest = scrollLeft + unit;

        //don't exceed boundaries
        dest = Math.max(dest, 0);
        dest = Math.min(dest, this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);

        if (scrollLeft == dest) return;

        //use proper easing curve when distance is small
        if (Math.abs(dest - scrollLeft) < itemWidth) {
            easingClassName = 'wc-animate-scroll-near';
            this.scrollAllowInterrupt = false;
        }

        this.animateDiv = document.createElement('div');
        this.animateDiv.className = easingClassName;
        this.animateDiv.style.left = scrollLeft + 'px';
        document.body.appendChild(this.animateDiv);

        //capture ComputedStyle every millisecond
        this.scrollSyncTimer = setInterval(() => {
            const num = parseFloat(getComputedStyle(this.animateDiv).left);
            this.scrollDiv.scrollLeft = num;
        }, 1);

        //don't let the browser optimize the setting of 'this.animateDiv.style.left' - we need this to change values to trigger the CSS animation
        //we accomplish this by calling 'this.animateDiv.style.left' off this thread, using setTimeout
        this.scrollStartTimer = setTimeout(() => {
            this.animateDiv.style.left = dest + 'px';

            let duration = 1000 * parseFloat(getComputedStyle(this.animateDiv).transitionDuration);
            if (duration) {
                //slightly longer that the CSS time so we don't cut it off prematurely
                duration += 50;

                //stop capturing
                this.scrollDurationTimer = setTimeout(() => this.clearScrollTimers(), duration);
            } else {
                this.clearScrollTimers();
            }
        }, 1);
    }

    render() {

        const style: React.CSSProperties = {};

        if (this.state.contentWidth && this.state.contentWidth > this.props.format.maxMessageContentWidth) {
            style.width = this.props.format.maxMessageContentWidth;
        }

        return (
            <div className="wc-carousel" ref={ div => this.root = div } style={ style }>
                <button disabled={!this.state.previousButtonEnabled} className="scroll previous" onClick={ () => this.scrollBy(-1) }>
                    <svg>
                        <path d="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" />
                    </svg>
                </button>
                <div className="wc-carousel-scroll-outer">
                    <div className="wc-carousel-scroll" ref={ div => this.scrollDiv = div }>
                        <CarouselAttachments
                            {... this.props}
                            onImageLoad = { () => this.props.onImageLoad() }
                        />
                    </div>
                </div>
                <button disabled={ !this.state.nextButtonEnabled } className="scroll next" onClick={ () => this.scrollBy(1) }>
                    <svg>
                        <path d="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z" />
                    </svg>
                </button>
            </div >
        )
    }
}

interface CarouselAttachmentProps {
    format: FormatState
    attachments: Attachment[]
    onCardAction: (type: string, value: string) => void
    onImageLoad: ()=> void
}

class CarouselAttachments extends React.Component<CarouselAttachmentProps, {}> {

    render() {
        return (
            <ul>{this.props.attachments.map((attachment, index) =>
                <li key={ index } className="wc-carousel-item">
                    <AttachmentView
                        attachment={ attachment }
                        format={ this.props.format }
                        onCardAction={ this.props.onCardAction }
                        onImageLoad={ () => this.props.onImageLoad() }
                    />
                </li>
            )}</ul>
        );
    }
}
