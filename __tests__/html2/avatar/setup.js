const createDefaultProps = extraProps => ({
  avatarMiddleware: () => next => args => {
    const { activity } = args;
    const { text = '' } = activity;

    if (~text.indexOf('override avatar')) {
      return () =>
        React.createElement(
          'div',
          {
            style: {
              alignItems: 'center',
              backgroundColor: 'Red',
              borderRadius: 4,
              color: 'White',
              display: 'flex',
              fontFamily: "'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'",
              height: 128,
              justifyContent: 'center',
              width: '100%'
            }
          },
          React.createElement('div', {}, activity.from.role)
        );
    } else if (~text.indexOf('no avatar')) {
      return false;
    }

    return next(args);
  },
  styleOptions: {
    botAvatarBackgroundColor: '#77F',
    botAvatarInitials: 'WC',
    userAvatarBackgroundColor: '#F77',
    userAvatarInitials: 'WW'
  },
  ...extraProps
});

const createFullCustomizedProps = args => {
  const props = createDefaultProps(args);

  return {
    ...props,
    styleOptions: {
      ...props.styleOptions,
      bubbleBorderColor: 'Black',
      bubbleBorderRadius: 10,
      bubbleFromUserBorderColor: 'Black',
      bubbleFromUserBorderRadius: 10,
      bubbleFromUserNubOffset: 5,
      bubbleFromUserNubSize: 10,
      bubbleNubOffset: 5,
      bubbleNubSize: 10
    }
  };
};

// Sends `text` from the send box, then replies like the mock bot does to a command it does not know.
const sendUnknownCommand = async (directLine, text) => {
  await (
    await directLine.actPostActivity(() => pageObjects.sendMessageViaSendBox(text, { waitForSend: false }))
  ).resolveAll();

  await directLine.emulateIncomingActivity(`Unknown command: \`${text}\`.\r\n\r\nType \`help\` to learn more.`);
};

export { createDefaultProps, createFullCustomizedProps, sendUnknownCommand };
