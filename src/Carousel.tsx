import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App.tsx';
import { IAttachment, Attachment } from './Attachment.tsx';

interface Props {
    attachments: any[];
    actions: HistoryActions;
}

interface State {
    previousButtonEnabled: boolean;
    nextButtonEnabled: boolean;
}

export class Carousel extends React.Component<Props, State> {

    private itemWidth: number;
    private ul: HTMLUListElement
    private scrollDiv: HTMLDivElement;
    private scrollStartTimer: number;
    private scrollSyncTimer: number;
    private scrollDurationTimer: number;
    private animateDiv: HTMLDivElement;
    private scrollEventListener: () => void;
    private scrollAllowInterrupt = true;

    constructor(props: Props) {
        super();

        this.state = {
            previousButtonEnabled: false,
            nextButtonEnabled: false
        };

        this.scrollEventListener = () => this.onScroll();
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

    private manageScrollButtons() {
        const previousEnabled = this.scrollDiv.scrollLeft > 0;
        const max = this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth;
        const nextEnabled = this.scrollDiv.scrollLeft < max;

        //TODO: both buttons may become disabled when the container is wide, and will not become re-enabled unless a resize event calls manageScrollButtons()
        const newState: State = {
            previousButtonEnabled: previousEnabled,
            nextButtonEnabled: nextEnabled
        };

        this.setState(newState);
    }

    private componentDidMount() {
        const li = this.ul.firstChild as HTMLLIElement;
        this.itemWidth = li.offsetWidth;

        this.manageScrollButtons();

        this.scrollDiv.addEventListener('scroll', this.scrollEventListener);

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
    }

    private componentWillUnmount() {
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

        const unit = increment * this.itemWidth;
        const scrollLeft = this.scrollDiv.scrollLeft;
        let dest = scrollLeft + unit;

        //don't exceed boundaries
        dest = Math.max(dest, 0);
        dest = Math.min(dest, this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);

        if (scrollLeft == dest) return;

        //use proper easing curve when distance is small
        if (Math.abs(dest - scrollLeft) < this.itemWidth) {
            easingClassName = 'wc-animate-scroll-near';
            this.scrollAllowInterrupt = false;
        }

        this.animateDiv = document.createElement('div');
        this.animateDiv.className = easingClassName;
        this.animateDiv.style.left = scrollLeft + 'px';
        document.body.appendChild(this.animateDiv);
         
        //capture ComputedStyle every millisecond
        this.scrollSyncTimer = setInterval(() => {
            var num = parseFloat(getComputedStyle(this.animateDiv).left);
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
                this.scrollDurationTimer = setTimeout(() => {
                    this.clearScrollTimers();
                }, duration);

            } else {
                this.clearScrollTimers();
            }

        }, 1);
    }

    render() {

        const items = this.props.attachments.map(attachment => <li><Attachment attachment={attachment} actions={this.props.actions}/></li>);

        return <div className="wc-carousel">
            <button disabled={!this.state.previousButtonEnabled} className="scroll previous" onClick={() => this.scrollBy(-1) }>
                <svg>
                    <path d="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" />
                </svg>
            </button>
            <div className="wc-carousel-scroll-outer">
                <div className="wc-carousel-scroll" ref={div => this.scrollDiv = div}>
                    <ul ref={ul => this.ul = ul}>{items}</ul>
                </div>
            </div>
            <button disabled={!this.state.nextButtonEnabled} className="scroll next" onClick={() => this.scrollBy(1) }>
                <svg>
                    <path d="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z" />
                </svg>
            </button>
        </div >;
    }
}
