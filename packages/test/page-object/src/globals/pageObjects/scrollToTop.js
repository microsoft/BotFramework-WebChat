import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import scrollStabilized from '../pageConditions/scrollStabilized';

// When the transcript is resized while scrolling to the bottom, react-scroll-to-bottom may ignore the "scroll" event and miss the new size.
// The next scroll will be mistaken as a resize while sticky, and it will scroll back to the bottom. Waiting will not bring it back up.
// Like a user, we scroll again. By then, react-scroll-to-bottom has learnt the new size.
// TODO: [P2] Remove the retry after https://github.com/compulim/react-scroll-to-bottom/pull/145 is released.
const MAX_ATTEMPTS = 3;

/** True, if `value` is a negative number, negative zero, or negative infinity, otherwise, false. */
function isNegative(value) {
  return value === -Infinity || 1 / value < 0;
}

/**
 * Scroll to a specific offset from top.
 *
 * @param {number} offset Offset from top. Pass negatives for offset from bottom.
 */
export default async function scrollToTop(offset = 0) {
  // Before scrolling to top, wait until the scroll is stabilized.
  await scrollStabilized();

  const transcriptScrollable = getTranscriptScrollableElement();
  const maxOffset = transcriptScrollable.scrollHeight - transcriptScrollable.offsetHeight;

  // Handles any numbers, 0, -0, Infinity, and -Infinity.
  offset = Math.max(0, Math.min(maxOffset, isNegative(offset) ? maxOffset + offset : offset));

  for (let attempt = 1; ; attempt++) {
    transcriptScrollable.scrollTop = offset;

    // Wait until the scroll settles, wherever it lands.
    // eslint-disable-next-line no-await-in-loop
    await scrollStabilized();

    if (Math.abs(transcriptScrollable.scrollTop - offset) <= 1 || attempt >= MAX_ATTEMPTS) {
      break;
    }
  }

  await scrollStabilized(offset);
}
