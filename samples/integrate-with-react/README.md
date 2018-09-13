# Sample

A simple web page with a maximized Web Chat and hosted using React.

# How to run

- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Type `markdown`, you should see the sample of Markdown
- Type `card weather`, you should see a weather card built using Adaptive Cards
- Type `layout carousel`, you should see a carousel of cards
   - Resize the window and see how the carousel change its size

# Study

The core of the code looks like the following:

```js
const { createStore, ReactWebChat } = window.WebChat;
const { Provider } = window.ReactRedux;
const store = createStore();

window.ReactDOM.render(
  <Provider store={ store }>
    <ReactWebChat
      directLine={ window.WebChat.createDirectLine({ token }) }
    />
  </Provider>,
  document.getElementById('webchat')
);
```

In our design, we think we should allow developers to bring in their own version of backend with the Web Chat UI. Therefore, the backend (a.k.a. Redux facility) can be used separately without the UI (a.k.a. React component).

When instantiating Web Chat using React, one would need to use [`react-redux/Provider`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#provider-store) to connect them together.
