import PropTypes from 'prop-types';

const RunHook = ({ fn, resolve }) => {
  resolve(fn?.());

  return false;
};

RunHook.defaultProps = { fn: undefined };

RunHook.propTypes = {
  fn: PropTypes.func,
  resolve: PropTypes.func.isRequired
};

export default function createRenderWebChatWithHook(props, element) {
  const {
    WebChat: {
      Components: { BasicWebChat, Composer }
    }
  } = window;

  return (hookFn, extraProps) => {
    const hookWithResolvers = !!hookFn && Promise.withResolvers();
    const renderWithResolvers = Promise.withResolvers();

    // We are not using Babel JSX transform to make the call stack easier to read.
    window.ReactDOM.render(
      <Composer {...props} {...extraProps}>
        <BasicWebChat />
        {!!hookFn && <RunHook fn={hookFn} resolve={hookWithResolvers.resolve} />}
      </Composer>,
      element,
      renderWithResolvers.resolve
    );

    return Promise.all([hookWithResolvers, renderWithResolvers]);
  };
}
