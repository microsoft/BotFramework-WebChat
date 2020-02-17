import useActiveTyping from './hooks/useActiveTyping';
import useRenderTypingIndicator from './hooks/useRenderTypingIndicator';

function useTypingIndicatorVisible() {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).filter(({ role }) => role !== 'user').length];
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  return renderTypingIndicator({ activeTyping, typing });
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
