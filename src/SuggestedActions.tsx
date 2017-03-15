import * as React from 'react';
import { CardAction } from 'botframework-directlinejs';
import { HScroll } from './HScroll';

export interface Props {
    onCardAction: (type: string, value: string) => void;
    actions: CardAction[];
}

export class SuggestedActions extends React.Component<Props, {}> {
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
            <div className="wc-suggested-actions">
                <HScroll
                    prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                    nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                    scrollUnit="page"
                >
                    <ul>
                        { this.props.actions.map((action, index) => <li key={ index }><button onClick={ e => this.actionClick(e, action) } title={ action.title } >{ action.title }</button></li>) }
                    </ul>
                </HScroll>
            </div>
        );
    }

}
