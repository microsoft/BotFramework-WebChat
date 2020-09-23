import { CardAction, Message} from 'botframework-directlinejs';
import * as React from 'react';
import { connect } from 'react-redux';
import { activityWithSuggestedActions } from './activityWithSuggestedActions';
import { doCardAction, IDoCardAction } from './Chat';
import { filteredActivities } from './History';
import { ChatState } from './Store';
import { ChatActions, sendMessage } from './Store';

export interface MessagePaneProps {
    activityWithSuggestedActions: Message;
    // activityWithDateAndTimePicker: Message;

    takeSuggestedAction: (message: Message) => any;
    chooseOption: (placeholder: string) => any;
    resetShellInput: () => any;
    sendMessage: (inputText: string) => void;

    children: React.ReactNode;
    doCardAction: IDoCardAction;
    multipleSelect: boolean;
}

export interface MultipleChoiceState {
    selected: boolean[];
}

class SuggestedActions extends React.Component<MessagePaneProps, MultipleChoiceState> {
    constructor(props: MessagePaneProps) {
        super(props);

        this.state = {
            selected: []
        };
    }

    actionClick(e: React.MouseEvent<HTMLElement>, cardAction: CardAction) {

        // "stale" actions may be displayed (see shouldComponentUpdate), do not respond to click events if there aren't actual actions
        if (!this.props.activityWithSuggestedActions) { return; }

        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        this.props.doCardAction(cardAction.type, cardAction.value);
        this.props.resetShellInput();
        e.stopPropagation();
    }

    handleSelect(index: number) {
        const newSelection = this.state.selected.slice();
        newSelection[index] = !newSelection[index];
        this.setState({selected: newSelection});
    }

    submitMultipleSelect(e: React.MouseEvent<HTMLElement>) {
        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        const cardType = this.props.activityWithSuggestedActions.suggestedActions.actions[0].type;
        const selectedAnswers: string[] = [];
        this.state.selected.forEach((selected, index) => {
            if (selected) {
                selectedAnswers.push(this.props.activityWithSuggestedActions.suggestedActions.actions[index].value);
            }
        });
        this.props.doCardAction(cardType, JSON.stringify({ selected: selectedAnswers }));
        this.props.resetShellInput();
        e.stopPropagation();
    }

    componentDidMount() {
        if (this.props.multipleSelect) {
            this.props.chooseOption('Select all that apply...');
            if (this.state.selected.length === 0) {
                const defaultSelected = new Array(this.props.activityWithSuggestedActions.suggestedActions.actions.length).fill(false);
                this.setState({ selected: defaultSelected });
            }
        } else {
            this.props.chooseOption('Choose an option above...');
        }

    }

    shouldComponentUpdate(nextProps: MessagePaneProps) {
        // update only when there are actions. We want the old actions to remain displayed as it animates down.
        return !!nextProps.activityWithSuggestedActions;
    }

    render() {
        if (!this.props.activityWithSuggestedActions) { return null; }

        return (
            <div className="wc-suggested-options">
                <ul>{ this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) =>
                    <li className={this.props.multipleSelect && this.state.selected[index] ? 'wc-suggested-options-option-selected' : 'wc-suggested-options-option'} key={ index } onClick={e => this.props.multipleSelect ? this.handleSelect(index) : this.actionClick(e, action) } title={ action.title }>
                        { action.title }
                    </li>
                ) }</ul>
                {this.props.multipleSelect && <button className="wc-suggested-options-submit" onClick={e => this.submitMultipleSelect(e)}>Submit</button>}
            </div>
        );
    }
}

export const MultipleChoiceCard = connect(
    (state: ChatState) => ({
        // passed down to MessagePaneView
        activityWithSuggestedActions: activityWithSuggestedActions(filteredActivities(state.history.activities, state.format.strings.pingMessage)),
        // only used to create helper functions below
        botConnection: state.connection.botConnection,
        user: state.connection.user,
        locale: state.format.locale
    }), {
        takeSuggestedAction: (message: Message) => ({ type: 'Take_SuggestedAction', message } as ChatActions),
        chooseOption: (placeholder: string) => ({ type: 'Choose_Option', placeholder} as ChatActions),
        resetShellInput: () => ({ type: 'Submit_Date' } as ChatActions),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): MessagePaneProps => ({
        // from stateProps
        activityWithSuggestedActions: stateProps.activityWithSuggestedActions,

        // from dispatchProps
        takeSuggestedAction: dispatchProps.takeSuggestedAction,
        chooseOption: dispatchProps.chooseOption,
        resetShellInput: dispatchProps.resetShellInput,
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        // from ownProps
        children: ownProps.children,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
        multipleSelect: stateProps.activityWithSuggestedActions &&
            stateProps.activityWithSuggestedActions.entities &&
            stateProps.activityWithSuggestedActions.entities.length > 0 &&
            stateProps.activityWithSuggestedActions.entities[0].multiple_selection
    })
)(SuggestedActions);
