import React from 'react';

import renderChatComponent from 'chat-component';

// This component will create a <div> and render ChatComponent using another version of React located inside that package
class ChatComponentWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.saveChatComponentRef = ref => (this.chatComponentRef = ref);
  }

  componentDidMount() {
    this.componentDidMountOrUpdate();
  }

  componentDidUpdate() {
    this.componentDidMountOrUpdate();
  }

  componentWillUnmount() {
    this.unmountChatComponent();
  }

  componentDidMountOrUpdate() {
    this.unmountChatComponent = renderChatComponent(this.props, this.chatComponentRef);
  }

  render() {
    return <div ref={this.saveChatComponentRef} />;
  }
}

export default ChatComponentWrapper;
