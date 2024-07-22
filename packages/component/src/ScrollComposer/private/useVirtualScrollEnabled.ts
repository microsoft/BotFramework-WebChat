import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

const useVirtualScrollEnabled = () => {
  const [{ enableVirtualScroll }] = useStyleOptions();
  return enableVirtualScroll;
};

export default useVirtualScrollEnabled;
