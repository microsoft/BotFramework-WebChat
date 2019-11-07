# Using different versions of React for hosting an app with Web Chat

In Web Chat version 4.6, we migrated to React Hooks, which requires React 16.8.6 and up.

In this sample, we will show how to use Web Chat in a hosting app with React version 16.0.0, instead of the required 16.8.6.

There are several key limitations in this sample. They are outlined in [this section](#why-not-to-use-two-versions-of-react).

# How to run locally

![Web Chat using React 16.8.6 hosting in an app using React 16.0.0](docs/screenshot1.png)

To run this sample, follow steps below:

1. Clone this repository
1. Run `npm install`
1. Run `npm start`
1. Browse to http://localhost:3000/

# How it works

There are two packages in this [monorepo](https://en.wikipedia.org/wiki/Monorepo):

-  `app`: the hosting app, created using [`create-react-app`](https://github.com/facebook/create-react-app)
   -  Requires `react@16.0.0` and `react-dom@16.0.0`
-  `chat-component`: the chat component, which will render Web Chat
   -  Requires `react@16.8.6` and `react-dom@16.8.6`

The hosting app will create an [isolated DOM element](https://reactjs.org/docs/integrating-with-other-libraries.html) and pass it to the `chat-component` package. The chat component will control the rendering of the DOM element, while the hosting app controls the lifetime.

The hosting app will tell the chat component when it is time to remove the DOM element from the tree, and the chat component should stop any further rendering.

## Chat component

In `chat-component` package, we created an entrypoint for rendering a React component to a specific DOM element. Note that we are using `react-dom@16.8.6` when mounting and unmounting the component to the DOM.

```jsx
import { render, unmountComponentAtNode } from 'react-dom';

function renderChatComponent(props, node) {
   render(<ChatComponent {...props} />, node);

   return () => unmountComponentAtNode(node);
}
```

> This entrypoint will return a function, which, when called, will unmount the component. This function call can be [called multiple times to update the props](https://reactjs.org/docs/react-dom.html#render).

## Hosting app

In the host application, we created a new component called `<ChatComponentWrapper>` and save the reference.

```jsx
class ChatComponentWrapper extends React.Component {
   constructor(props) {
      super(props);

      this.saveChatComponentRef = ref => (this.chatComponentRef = ref);
   }

   render() {
      return <div ref={this.saveChatComponentRef} />;
   }
}
```

When `<ChatComponentWrapper>` is mounted or updated, we will call `chat-component` to do the rendering.

```diff
+ import renderChatComponent from 'chat-component';

  class ChatComponentWrapper extends React.Component {
    constructor(props) {
      super(props);

      this.saveChatComponentRef = ref => this.chatComponentRef = ref;
    }

+   componentDidMount() {
+     this.componentDidMountOrUpdate();
+   }

+   componentDidUpdate() {
+     this.componentDidMountOrUpdate();
+   }

+   componentDidMountOrUpdate() {
+     renderChatComponent(this.props, this.chatComponentRef);
+   }

    render() {
      return (
        <div ref={ this.saveChatComponentRef } />
      );
    }
  }
```

When it is time to unmount, we will call to the `chat-component` to unmount the component.

```diff
  import renderChatComponent from 'chat-component';

  class ChatComponentWrapper extends React.Component {
    constructor(props) {
      super(props);

      this.saveChatComponentRef = ref => this.chatComponentRef = ref;
    }

    componentDidMount() {
      this.componentDidMountOrUpdate();
    }

    componentDidUpdate() {
      this.componentDidMountOrUpdate();
    }

    componentDidMountOrUpdate() {
-     renderChatComponent(this.props, this.chatComponentRef);
+     this.unmountChatComponent = renderChatComponent(this.props, this.chatComponentRef);
    }

+   componentWillUnmount() {
+     this.unmountChatComponent();
+   }

    render() {
      return (
        <div ref={ this.saveChatComponentRef } />
      );
    }
  }
```

# Why is this sample using two versions of React

Although we recommend that you upgrade your host app at your earliest convenience, we understand that host app may need some time before its React dependencies are updated, especially in regards to huge applications.

As stated in [this article](https://reactjs.org/warnings/invalid-hook-call-warning.html), React requires that all components using hooks exist in the same React DOM tree, and must use the _same instance_ of React.

In this approach, we isolated the DOM element from the React DOM tree. Then we use another `react-dom` package to continue the rendering. So the React DOM tree is virtually divided into two parts, although they looks contiguous. This approach is a [supported scenario outlined in React docs](https://reactjs.org/docs/integrating-with-other-libraries.html).

# Why not to use two versions of React

There are several key limitations to this approach:

-  Increased memory usage and bundle size
-  Only `props` can be passed between two DOM trees; React Context cannot be passed between them without extra work
   -  It is doable, but will require two different context objects and they must be wired up manually
   -  This includes `<Provider>` and `connect()` HOC in `react-redux`
-  [React-based customizations](https://github.com/microsoft/botframework-webchat#customize-web-chat-ui) added to Web Chat will still require React 16.8.6 or up
   -  For example, activity and attachment middleware require the newer version of React
-  Introducing new package(s), which could increase unnecessary fragmentation in your codebase
-  The rendering processes between two DOM trees are asynchronous and not guaranteed to complete at the same time

# Further reading

-  [Web Chat: Customize Web Chat UI](https://github.com/microsoft/botframework-webchat#customize-web-chat-ui)
-  [React: Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
-  [React: Integrating with Other Libraries](https://reactjs.org/docs/integrating-with-other-libraries.html)
-  [React: Invalid Hook Call Warning](https://reactjs.org/warnings/invalid-hook-call-warning.html)
