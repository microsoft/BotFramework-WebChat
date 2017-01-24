import * as React from 'react';
import { Attachment } from './BotConnection';
import { AttachmentView } from './Attachment';
import { FormatOptions } from './Chat';
import { Strings } from './Strings';

interface Props {
    options: FormatOptions,
    strings: Strings,
    attachments: Attachment[],
    onClickButton: (type: string, value: string) => void,
    onImageLoad: ()=> void
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
    private resizeListener = () => this.resize();
    private scrollEventListener =() => this.onScroll();
    private scrollAllowInterrupt = true;

    constructor(props: Props) {
        super(props);

        this.state = {
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

    private setItemWidth(didMount: boolean = false) {
        const li = this.ul.firstChild as HTMLLIElement;
        this.itemWidth = li.offsetWidth;
    }

    private componentDidMount() {
        this.setItemWidth(true);

        this.manageScrollButtons();

        this.scrollDiv.addEventListener('scroll', this.scrollEventListener);

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';

        window.addEventListener('resize', this.resizeListener);
    }

    private componentWillUnmount() {
        this.scrollDiv.removeEventListener('scroll', this.scrollEventListener);
        window.removeEventListener('resize', this.resizeListener);
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
                this.scrollDurationTimer = setTimeout(() => this.clearScrollTimers(), duration);
            } else {
                this.clearScrollTimers();
            }
        }, 1);
    }

    render() {
        return (
            <div className="wc-carousel">
				<button disabled={!this.state.previousButtonEnabled} className="scroll previous" onClick={() => this.scrollBy(-1) }>
					<svg>
						<g id="scroll-prev" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					 		<g fill="#cccccc" id="Houston-Chronicle---Chat-Window" transform="rotate(179.454345703125 20,20.000000000000004)">
								<g id="ic_circle_right">
									<path id="Shape" d="m20,40c-11,0 -20,-9 -20,-20c0,-11 9,-20 20,-20c11,0 20,9 20,20c0,11 -9,20 -20,20zm0,-36.66667c-9.16667,0 -16.66667,7.5 -16.66667,16.66667c0,9.16667 7.5,16.66667 16.66667,16.66667c9.16667,0 16.66667,-7.5 16.66667,-16.66667c0,-9.16667 -7.5,-16.66667 -16.66667,-16.66667z"/>
									<path id="Shape" d="m26.66667,21.66667c-0.5,0 -0.83334,-0.16667 -1.16667,-0.5l-5,-5c-0.66667,-0.66667 -0.66667,-1.66667 0,-2.33334c0.66667,-0.66666 1.66667,-0.66666 2.33333,0l5,5c0.66667,0.66667 0.66667,1.66667 0,2.33334c-0.33333,0.33333 -0.66666,0.5 -1.16666,0.5z"/>
									<path id="Shape" d="m21.66667,26.66667c-0.5,0 -0.83334,-0.16667 -1.16667,-0.5c-0.66667,-0.66667 -0.66667,-1.66667 0,-2.33334l5,-5c0.66667,-0.66666 1.66667,-0.66666 2.33333,0c0.66667,0.66667 0.66667,1.66667 0,2.33334l-5,5c-0.33333,0.33333 -0.66666,0.5 -1.16666,0.5z"/>
									<path id="Shape" d="m26.66667,21.66667l-13.33334,0c-1,0 -1.66666,-0.66667 -1.66666,-1.66667c0,-1 0.66666,-1.66667 1.66666,-1.66667l13.33334,0c1,0 1.66666,0.66667 1.66666,1.66667c0,1 -0.66666,1.66667 -1.66666,1.66667z"/>
								</g>
							</g>
						</g>
					</svg>
				</button>
				<div className="wc-carousel-scroll-outer">
					<div className="wc-carousel-scroll" ref={ div => this.scrollDiv = div }>
						<ul ref={ ul => this.ul = ul }>{ this.props.attachments.map((attachment, index) =>
							<li key={ index }>
								<AttachmentView
									attachment={ attachment }
									options={ this.props.options }
									strings={ this.props.strings }
									onClickButton={ this.props.onClickButton }
									onImageLoad={ () => this.resize() }
									/>
							</li>) }
						</ul>
					</div>
				</div>
				<button disabled={ !this.state.nextButtonEnabled } className="scroll next" onClick={ () => this.scrollBy(1) }>
					<svg>
						<g id="scroll-next" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
							<g id="Houston-Chronicle---Chat-Wrindow" transform="translate(-322.000000, -1541.000000)" fill="#cccccc">
								<g id="ic_circle_right" transform="translate(322.000000, 1541.000000)">
									<path d="M20,40 C9,40 0,31 0,20 C0,9 9,0 20,0 C31,0 40,9 40,20 C40,31 31,40 20,40 Z M20,3.33333333 C10.8333333,3.33333333 3.33333333,10.8333333 3.33333333,20 C3.33333333,29.1666667 10.8333333,36.6666667 20,36.6666667 C29.1666667,36.6666667 36.6666667,29.1666667 36.6666667,20 C36.6666667,10.8333333 29.1666667,3.33333333 20,3.33333333 Z" id="Shape"/>
									<path d="M26.6666667,21.6666667 C26.1666667,21.6666667 25.8333333,21.5 25.5,21.1666667 L20.5,16.1666667 C19.8333333,15.5 19.8333333,14.5 20.5,13.8333333 C21.1666667,13.1666667 22.1666667,13.1666667 22.8333333,13.8333333 L27.8333333,18.8333333 C28.5,19.5 28.5,20.5 27.8333333,21.1666667 C27.5,21.5 27.1666667,21.6666667 26.6666667,21.6666667 Z" id="Shape"/>
									<path d="M21.6666667,26.6666667 C21.1666667,26.6666667 20.8333333,26.5 20.5,26.1666667 C19.8333333,25.5 19.8333333,24.5 20.5,23.8333333 L25.5,18.8333333 C26.1666667,18.1666667 27.1666667,18.1666667 27.8333333,18.8333333 C28.5,19.5 28.5,20.5 27.8333333,21.1666667 L22.8333333,26.1666667 C22.5,26.5 22.1666667,26.6666667 21.6666667,26.6666667 Z" id="Shape"/>
									<path d="M26.6666667,21.6666667 L13.3333333,21.6666667 C12.3333333,21.6666667 11.6666667,21 11.6666667,20 C11.6666667,19 12.3333333,18.3333333 13.3333333,18.3333333 L26.6666667,18.3333333 C27.6666667,18.3333333 28.3333333,19 28.3333333,20 C28.3333333,21 27.6666667,21.6666667 26.6666667,21.6666667 Z" id="Shape"/>
								</g>
							</g>
						</g>
					</svg>
				</button>
			</div >
        )
    }

    resize() {
        this.setItemWidth();
        this.manageScrollButtons();
        this.props.onImageLoad();
    }
}
