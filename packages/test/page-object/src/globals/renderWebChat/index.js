export default function renderWebChat(props, container) {
  if (!props || !container) {
    throw new Error('Both props and container must be provided');
  }

  if (!window.WebChat) {
    throw new Error('WebChat must be provided');
  }

  const { searchParams } = new URL(window.location.href);
  const isFluentTheme = searchParams.get('theme') === 'fluent';

  if (isFluentTheme) {
    if (!window.React || !window.ReactDOM) {
      throw new Error('React and ReactDOM must be provided for Fluent theme rendering');
    }

    const {
      React,
      ReactDOM: { render },
      WebChat: {
        FluentThemeProvider,
        Components: { ReactWebChat }
      }
    } = window;
    render(React.createElement(FluentThemeProvider, null, React.createElement(ReactWebChat, props)), container);
  } else {
    window.WebChat.renderWebChat(props, container);
  }

  return { isFluentTheme };
}
