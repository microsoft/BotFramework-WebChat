import * as React from 'react';
import { konsole } from './Chat';

export interface HScrollProps {
    prevSvgPathData: string;
    nextSvgPathData: string;
}

export class HScroll extends React.Component<HScrollProps, {}> {
    private prevButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;
    private scrollDiv: HTMLDivElement;
    private scrollStartTimer: number;
    private scrollSyncTimer: number;
    private scrollDurationTimer: number;
    private animateDiv: HTMLDivElement;
    private scrollEventListener = () => this.onScroll();
    private scrollAllowInterrupt = true;

    constructor(props: HScrollProps) {
        super(props);
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

    private getScrollButtonState() {
        return {
            previousButtonEnabled: this.scrollDiv.scrollLeft > 0,
            nextButtonEnabled: this.scrollDiv.scrollLeft < this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth
        };
    }

    public manageScrollButtons() {
        if (!this.prevButton || !this.nextButton || !this.scrollDiv) return;
        
        var desiredButtonState = this.getScrollButtonState();

        this.prevButton.disabled = !desiredButtonState.previousButtonEnabled;
        this.nextButton.disabled = !desiredButtonState.nextButtonEnabled;
    }

    mount(scrollDiv: HTMLDivElement) {
        if (this.scrollDiv) return;

        this.scrollDiv = scrollDiv;

        this.manageScrollButtons();

        this.scrollDiv.addEventListener('scroll', this.scrollEventListener);

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
    }

    componentDidMount() {
        this.manageScrollButtons();
    }

    componentDidUpdate() {
        if (!this.scrollDiv) return;
        this.scrollDiv.scrollLeft = 0;

        this.manageScrollButtons();
    }

    componentWillUnmount() {
        this.scrollDiv.removeEventListener('scroll', this.scrollEventListener);
    }

    private onScroll() {
        this.manageScrollButtons();
    }

    private scrollBy(direction: number) {

        if (!this.scrollAllowInterrupt) return;

        let easingClassName = 'wc-animate-scroll';

        //cancel existing animation when clicking fast
        if (this.animateDiv) {
            easingClassName = 'wc-animate-scroll-rapid';
            this.clearScrollTimers();
        }

        //todo: use a good page size
        const itemWidth = this.scrollDiv.offsetWidth;

        const unit = direction * itemWidth;
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

        return (
            <div>
                <button ref={ button => this.prevButton = this.prevButton || button } className="scroll previous" onClick={ () => this.scrollBy(-1) }>
                    <svg>
                        <path d={ this.props.prevSvgPathData } />
                    </svg>
                </button>
                <div className="wc-hscroll-outer">
                    <div className="wc-hscroll" ref={ div => this.mount(div) }>
                        { this.props.children }
                    </div>
                </div>
                <button ref={ button => this.nextButton = this.nextButton || button } className="scroll next" onClick={ () => this.scrollBy(1) }>
                    <svg>
                        <path d={ this.props.nextSvgPathData } />
                    </svg>
                </button>
            </div >
        )
    }
}
