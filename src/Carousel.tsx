import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App.tsx';
import { IAttachment, Attachment } from './Attachment.tsx';

export interface Props {
    attachments: any[];
    actions: HistoryActions;
}

interface State {
    scrollIndex: number;
    itemWidth: number;
}

export class Carousel extends React.Component<Props, State> {

    constructor(props: Props) {
        super();

        this.state = {
            scrollIndex: 0,
            itemWidth: null
        };

    }

    private measureFirstLi(ul: HTMLUListElement) {
        if (!this.state.itemWidth) {
            var li = ul.firstChild as HTMLLIElement;
            this.state.itemWidth = li.offsetWidth;
        }
    }

    private scrollBy(increment: number) {
        this.state.scrollIndex -= increment;

        this.setState(this.state);
    }

    render() {

        let items = this.props.attachments.map((attachment, i) => {
            return <li><Attachment attachment={attachment} actions={this.props.actions}/></li>;
        }) as React.ReactElement<any>[];

        let style = {
            marginLeft: this.state.itemWidth ? this.state.scrollIndex * this.state.itemWidth : 0
        };

        return <div className="wc-carousel">
            <button className="scroll previous" onClick={() => { this.scrollBy(-1); } }>left</button>
            <ul style={style} ref={(ul) => { this.measureFirstLi(ul); } }>{items}</ul>
            <button className="scroll next" onClick={() => { this.scrollBy(1); } }>right</button>
        </div>;
    }
}
