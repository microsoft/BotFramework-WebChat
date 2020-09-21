import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { findInitial } from './History';
import { ChatState, Conversation, FormatState } from './Store';

export interface Props {
  conversations: Conversation[];
  setSelectedConversation: (conversation: Conversation) => void;
  format: FormatState;
}

class PastConversationsView extends React.Component<Props> {
  render() {
    const { conversations, setSelectedConversation, format: {display_name, themeColor} } = this.props;

    const avatarColor = themeColor ? themeColor : '#c3ccd0';
    const avatarInitial = display_name && typeof(display_name) === 'string' ? findInitial(display_name) : 'B';

    moment.updateLocale('en', {
      relativeTime : {
          future: 'in %s',
          past: '%s ago',
          s  : '1s',
          ss : n => `${n}s`,
          m:  '1m',
          mm: n => `${n}m`,
          h:  '1h',
          hh: n => `${n}h`,
          d:  '1d',
          dd: n => `${n}d`,
          M:  '1mo',
          MM: n => `${n}mo`,
          y:  '1y',
          yy: n => `${n}y`
      }
  });

    return (
      <div className="conversations-wrapper">
        <div className="conversations-header">Conversations</div>
        <div className="conversations">
          {conversations.length > 0 &&
            conversations
              .filter(
                (conversation: Conversation) =>
                  conversation.conversation_messages.length > 0
              )
              .map((conversation: Conversation) => {
                const { conversation_messages } = conversation;
                const recentMessage =
                  conversation_messages.length > 0 &&
                  conversation_messages[conversation_messages.length - 1]
                    .message;
                return (
                  <div
                    onClick={() => setSelectedConversation(conversation)}
                    className="conversation"
                  >
                    <div className="conversation-widget" style={{backgroundColor: avatarColor}}>{avatarInitial}</div>
                    <div className="conversation-body">
                      <div className="conversation-text">
                        <div className="conversation-name">
                          {display_name ? display_name : 'Bot'}
                        </div>
                        <div className="conversation-message">
                          {recentMessage}
                        </div>
                      </div>
                      <div className="conversation-date">
                        {moment(conversation.updated_at).fromNow()}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    );
  }
}

export const PastConversations = connect(
  (state: ChatState) => ({
    conversations: state.conversations,
    format: state.format
  }),
  {},
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    format: stateProps.format,
    conversations: stateProps.conversations.conversations,
    setSelectedConversation: ownProps.setSelectedConversation
  })
)(PastConversationsView);
