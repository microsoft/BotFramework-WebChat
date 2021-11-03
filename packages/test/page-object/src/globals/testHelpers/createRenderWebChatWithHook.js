import createDeferred from 'p-defer';
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
    const hookDeferred = !!hookFn && createDeferred();
    const renderDeferred = createDeferred();

    // We are not using Babel JSX transform to make the call stack easier to read.
    window.ReactDOM.render(
      <Composer {...props} {...extraProps}>
        <BasicWebChat />
        {!!hookFn && <RunHook fn={hookFn} resolve={hookDeferred.resolve} />}
      </Composer>,
      element,
      renderDeferred.resolve
    );

    return Promise.all([hookDeferred, renderDeferred]);
  };
}
