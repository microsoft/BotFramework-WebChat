import getTranscriptScrollableElement from '../elements/transcriptScrollable';

function completed() {
  const scrollable = getTranscriptScrollableElement();

  return scrollable && scrollable.offsetHeight + scrollable.scrollTop === scrollable.scrollHeight;
}

export default function scrollToBottomCompleted() {
  return {
    message: 'scroll to bottom completed',
    fn: async () => {
      // Browser may keep rendering content. Wait until 5 consecutive completion checks are all truthy.
      for (let count = 0; count < 5; count++) {
        if (!completed()) {
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return true;
    }
  };
}
