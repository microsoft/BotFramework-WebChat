import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App.tsx';
import { IAttachment, Attachment } from './Attachment.tsx';

export interface Props {
    attachments: any[];
    actions: HistoryActions;
}

export interface State {
    scrollIndex: number;
    itemWidth: number;
    ul?: HTMLUListElement
    scrollDiv?: HTMLDivElement;
}

export class Carousel extends React.Component<Props, State> {

    constructor(props: Props) {
        super();

        this.state = {
            scrollIndex: 0,
            itemWidth: null
        };

    }

    private componentDidMount() {
        var li = this.state.ul.firstChild as HTMLLIElement;
        this.state.itemWidth = li.offsetWidth;
    }

    private scrollBy(increment: number) {
        //this.state.scrollIndex -= increment;
        //this.state.scrollDiv.scrollLeft += increment * this.state.itemWidth;
        //this.setState(this.state);

        //TODO: cancel existing animation when clicking fast
        //TODO: animate to boundaries

        var unit = increment * this.state.itemWidth;

        var div = document.createElement('div');
        div.className = 'wc-animate-scroll';
        div.style.left = this.state.scrollDiv.scrollLeft + 'px';
        document.body.appendChild(div);

        //capture ComputedStyle every millisecond
        var captureTimer = setInterval(() => {
            var num = parseFloat(getComputedStyle(div).left);
            this.state.scrollDiv.scrollLeft = num;
        }, 1);

        div.style.left = (this.state.scrollDiv.scrollLeft + unit) + 'px';

        //stop capturing
        var finishTimer = setTimeout(() => {
            clearInterval(captureTimer);
            document.body.removeChild(div);
        }, 1000 * parseFloat(getComputedStyle(div).transitionDuration) || 5000);

    }

    render() {

        let items = this.props.attachments.map((attachment, i) => {
            return <li><Attachment attachment={attachment} actions={this.props.actions}/></li>;
        }) as React.ReactElement<any>[];

        return <div className="wc-carousel">
            <button className="scroll previous" onClick={() => { this.scrollBy(-1); } }>left</button>
            <div className="wc-carousel-scroll" ref={(div: HTMLDivElement) => { this.state.scrollDiv = div; } }>
                <ul ref={(ul: HTMLUListElement) => { this.state.ul = ul; } }>{items}</ul>
            </div>
            <button className="scroll next" onClick={() => { this.scrollBy(1); } }>right</button>
        </div>;
    }
}
