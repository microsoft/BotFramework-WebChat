import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import scrollStabilized from '../pageConditions/scrollStabilized';

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

  transcriptScrollable.scrollTop = offset;

  await scrollStabilized(offset);
}
