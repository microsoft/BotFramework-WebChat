import useActiveTyping from './hooks/useActiveTyping';
import useRenderTypingIndicator from './hooks/useRenderTypingIndicator';

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  return renderTypingIndicator({ activeTyping, typing });
};

export default BasicTypingIndicator;

export { useActiveTyping };
