import * as React from 'react';
import { Activity, CardAction, User } from 'botframework-directlinejs';
import { ChatState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { HScroll } from './HScroll';
import { konsole, classList, doCardAction, sendMessage } from './Chat';

export interface MessagePaneProps {
    actions: CardAction[],
    doCardAction: (sendMessage: (text: string, from: User, locale: string) => void) => (type: string, value: string) => void,
    sendMessage: (value: string, user: User, locale: string) => void,
    children: React.ReactNode
}

const MessagePaneView = (props: MessagePaneProps) =>
    <div className={ classList('wc-message-pane', props.actions && 'show-actions' ) }>
        { props.children }
        <SuggestedActions { ... props }/>
    </div>;

class SuggestedActions extends React.Component<MessagePaneProps, {}> {
    constructor(props: MessagePaneProps) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {
        
        //click is only valid if there are props.actions
        if (this.props.actions) {
            this.props.doCardAction(this.props.sendMessage)(cardAction.type, cardAction.value);
        }
    
        e.stopPropagation();
    }

    shouldComponentUpdate(nextProps: MessagePaneProps) {
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

function suggestedActions(activities: Activity[]) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (!lastActivity || lastActivity.type !== 'message' || !lastActivity.suggestedActions || lastActivity.suggestedActions.length === 0)
        return;
    return lastActivity.suggestedActions;
}

export const MessagePane = connect(
    (state: ChatState): Partial<MessagePaneProps> => ({
        actions: suggestedActions(state.history.activities),
        doCardAction: doCardAction(state.connection.botConnection, state.connection.user, state.format.locale),
    }),
    (dispatch: Dispatch<any>): Partial<MessagePaneProps> => ({
        sendMessage: (value: string, user: User, locale: string) => sendMessage(dispatch, value, user, locale)
    })
)(MessagePaneView);
