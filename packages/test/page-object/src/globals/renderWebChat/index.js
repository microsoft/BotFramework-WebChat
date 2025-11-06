export default function renderWebChat(props, container) {
  if (!props || !container) {
    throw new Error('Both props and container must be provided');
  }

  if (!window.WebChat) {
    throw new Error('WebChat must be provided');
  }

  const { searchParams } = new URL(window.location.href);
  const isFluentTheme = searchParams.get('theme') === 'fluent';
  const isCopilotVariant =
    searchParams.get('variant') === 'copilot' || searchParams.get('variant') === 'copilot-deprecated';

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
    render(
      React.createElement(
        FluentThemeProvider,
        {
          ...(isCopilotVariant && { variant: 'copilot' })
        },
        React.createElement(ReactWebChat, props)
      ),
      container
    );
  } else {
    if (isCopilotVariant) {
      throw new Error('Copilot variant is only supported with Fluent theme');
    }
    window.WebChat.renderWebChat(props, container);
  }

  return { isFluentTheme, isCopilotVariant };
}
