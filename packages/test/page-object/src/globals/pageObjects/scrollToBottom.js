import scrollToTop from './scrollToTop';

/**
 * Scroll to a specific offset from bottom.
 *
 * @param {number} offset Offset from bottom. Pass negatives for offset from top.
 */
export default function scrollToBottom(offset = 0) {
  return scrollToTop(-offset);
}
