import withResolvers from '../../utils/withResolvers';

const RunHook = ({ fn, resolve }) => {
  resolve(fn?.());

  return false;
};

export default function createRenderWebChatWithHook(props, element) {
  const {
    WebChat: {
      Components: { BasicWebChat, Composer }
    }
  } = window;

  return (hookFn, extraProps) => {
    const hookWithResolvers = !!hookFn && withResolvers();
    const renderWithResolvers = withResolvers();

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
