const WAIT_FOR_ANIMATION = 2000;

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export default function mediaBuffered(mediaElement) {
  return {
    message: 'for media to finish buffering',
    fn: async () => {
      if (
        mediaElement.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA ||
        !mediaElement.buffered.length ||
        mediaElement.buffered.end(0) !== mediaElement.duration
      ) {
        return false;
      }

      // TODO: [P3] #3557 If the result is positive, audio finished buffering, we still need to wait for an unknown time to refresh the UI.
      //       Will be great if we can remove this sleep.
      await sleep(WAIT_FOR_ANIMATION);

      return true;
    }
  };
}
