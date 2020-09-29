import { hooks } from 'botframework-webchat-api';

const { useActiveTyping, useRenderTypingIndicator } = hooks;

function useTypingIndicatorVisible() {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).filter(({ role }) => role !== 'user').length];
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [visible] = useTypingIndicatorVisible();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  return renderTypingIndicator({ activeTyping, typing, visible });
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
