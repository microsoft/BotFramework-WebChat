import useTrackEvent from './useTrackEvent';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSubmitSendBox() {
  const { submitSendBox } = useWebChatUIContext();
  const trackEvent = useTrackEvent();

  return (...args) => {
    const [method = 'keyboard'] = args;

    trackEvent('submitSendBox', { method });

    return submitSendBox(...args);
  };
}
