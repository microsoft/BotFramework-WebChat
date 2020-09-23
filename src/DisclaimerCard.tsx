import { Activity, CardAction, DirectLine, DirectLineOptions, Message} from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { activityWithSuggestedActions } from './activityWithSuggestedActions';
import { doCardAction, IDoCardAction } from './Chat';
import { FormattedText } from './FormattedText';
import { filteredActivities } from './History';
import { ChatState } from './Store';
import { ChatActions, sendMessage } from './Store';

export interface Node {
  node_type: string;
  meta: any;
}

interface DisclaimerProps {
  activityWithSuggestedActions: Message;
  // activityWithDateAndTimePicker: Message;
  text: string;

  takeSuggestedAction: (message: Message) => any;
  chooseOption: (placeholder: string) => any;
  resetShellInput: () => any;
  sendMessage: (inputText: string) => void;

  children: React.ReactNode;
  doCardAction: IDoCardAction;

  onImageLoad: () => void;
}

export const activityIsDisclaimer = (activity: Activity) => {
  const activityCopy: any = activity;
  return activityCopy && activityCopy.entities && activityCopy.entities.length > 0 && activityCopy.entities[0].node_type === 'disclaimer';
};

class Disclaimer extends React.Component<DisclaimerProps, {}> {
  private bottomDiv: HTMLDivElement;

  constructor(props: DisclaimerProps) {
    super(props);
  }

  componentDidMount() {
    this.props.chooseOption('Choose an option above...');
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  actionClick(e: React.MouseEvent<HTMLElement>, cardAction: CardAction) {
    // "stale" actions may be displayed (see shouldComponentUpdate), do not respond to click events if there aren't actual actions
    if (!this.props.activityWithSuggestedActions) { return; }

    this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
    this.props.doCardAction(cardAction.type, cardAction.value);
    this.props.resetShellInput();
    e.stopPropagation();
  }

  shouldComponentUpdate(nextProps: DisclaimerProps) {
    // update only when there are actions. We want the old actions to remain displayed as it animates down.
    return !!nextProps.activityWithSuggestedActions;
  }

  scrollToBottom = () => {
    this.bottomDiv.scrollIntoView({ behavior: 'auto' });
  }

  render() {
    return (
      <div>
      <div className="disclaimer__card">
        <div className="disclaimer__card__message">
          <FormattedText
            text={ this.props.text }
            format={ 'markdown' }
            onImageLoad={ this.props.onImageLoad }
          />
        </div>
        <div className="disclaimer__card__buttons">
          <ul>{ this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) =>
            <button key={index} type="button" onClick={e => this.actionClick(e, action) } title={ action.title }>
            { action.title }
            </button>
          ) }</ul>
        </div>
        <div ref={el => this.bottomDiv = el}></div>

      </div>
      </div>
    );
  }
}

export const DisclaimerCard = connect(
  (state: ChatState) => {
    return {
      // passed down to MessagePaneView
      activityWithSuggestedActions: activityWithSuggestedActions(filteredActivities(state.history.activities, state.format.strings.pingMessage, state.format.strings.restartMessage)),
      // only used to create helper functions below
      botConnection: state.connection.botConnection,
      user: state.connection.user,
      locale: state.format.locale
    };
  }, {
    takeSuggestedAction: (message: Message) => ({ type: 'Take_SuggestedAction', message } as ChatActions),
    chooseOption: (placeholder: string) => ({ type: 'Choose_Option', placeholder} as ChatActions),
    resetShellInput: () => ({ type: 'Submit_Date' } as ChatActions),
    // only used to create helper functions below
    sendMessage
  }, (stateProps: any, dispatchProps: any, ownProps: any): DisclaimerProps => {
    return {
      // from stateProps
      text: ownProps.activity.text,
      onImageLoad: ownProps.onImageLoad,
      activityWithSuggestedActions: stateProps.activityWithSuggestedActions,

      // from dispatchProps
      takeSuggestedAction: dispatchProps.takeSuggestedAction,
      chooseOption: dispatchProps.chooseOption,
      resetShellInput: dispatchProps.resetShellInput,
      sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
      // from ownProps
      children: ownProps.children,
      // helper functions
      doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage)
    };
  }
)(Disclaimer);
