import * as React from 'react';
import { CardAction } from 'botframework-directlinejs';

export interface Props {
    onCardAction: (type: string, value: string) => void;
    actions: CardAction[];
}

export interface State {
}

export class SuggestedActions extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {

        if (!this.props.actions) return null;

        const onCardAction = (cardAction: CardAction) => cardAction &&
            (e => {
                this.props.onCardAction(cardAction.type, cardAction.value);
                e.stopPropagation();
            });

        return (
            <ul className="wc-suggested-actions">
                { this.props.actions.map((action, index) => <li key={ index }><button onClick={ onCardAction(action) }>{ action.title }</button></li>) }
            </ul>
        );
    }
}
