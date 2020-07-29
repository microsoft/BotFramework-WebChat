export default function escapeRegexp(emoticon) {
  return emoticon.replace(/[\\^$*+?.()|[\]{}]/gu, '\\$&');
}
