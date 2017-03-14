import * as React from 'react';
import { CardAction } from 'botframework-directlinejs';

export interface Props {
    onCardAction: (type: string, value: string) => void;
    actions: CardAction[];
}

export interface State {
}

export class SuggestedActions extends React.Component<Props, State> {

    private scrollDiv: HTMLDivElement;

    constructor(props: Props) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {
        
        //click is only valid if there are props.actions
        if (this.props.actions) {
            this.props.onCardAction(cardAction.type, cardAction.value);
        }
    
        e.stopPropagation();
    }

    shouldComponentUpdate(nextProps: Props) {

        //update only when there are actions. We want the old actions to remain displayed as it animates down.
        return !!nextProps.actions;
    }

    render() {
        if (!this.props.actions) return null;

        return (
            <div className="wc-suggested-actions wc-hscroll-outer">
                <div className="wc-hscroll" ref={ div => this.mount(div) }>
                    <ul>
                        { this.props.actions.map((action, index) => <li key={ index }><button onClick={ e => this.actionClick(e, action) }>{ action.title }</button></li>) }
                    </ul>
                </div>
            </div>
        );
    }

    componentDidUpdate() {
        if (!this.scrollDiv) return;
        this.scrollDiv.scrollLeft = 0;
    }

    mount(div: HTMLDivElement) {
        if (this.scrollDiv) return;
        
        this.scrollDiv = div;

        //this.manageScrollButtons();

        //this.scrollDiv.addEventListener('scroll', this.scrollEventListener);

        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
    }
}
