import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { Conversation, ConversationState } from './Store';

export interface Props {
  conversations: Conversation[];
  setSelectedConversation: (conversation: Conversation) => void;
}

class PastConversations extends React.Component<Props> {
  render() {
    const { conversations, setSelectedConversation } = this.props;
    console.log('TCL: PastConversations -> render -> conversations', conversations);

    return (
      <div className="conversations">
        {conversations.length > 0 && conversations.map((conversation: Conversation) => {
          console.log(conversation);
          return (
            <div onClick={() => setSelectedConversation(conversation)} className="conversation">
              <div className="conversation-widget">BR</div>
              <div className="conversation-body">
                <div className="conversation-text">
                  <div>{conversation.msft_conversation_id}</div>
                  <div className="conversation-message">Message</div>
                </div>
                <div className="conversation-date">
                  {moment(conversation.updated_at).fromNow()}
                </div>
              </div>
            </div>
          );
        }
        )}
      </div>
    );
  }
}

export default connect(
  (state: ConversationState) => ({
      conversations: state.conversations
  }),
  {},
  (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
    conversations: stateProps.conversations,
    setSelectedConversation: ownProps.setSelectedConversation
  })
)(PastConversations);
