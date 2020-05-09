export default function({ backgroundColor, rootHeight, rootWidth }) {
  return {
    backgroundColor,
    height: rootHeight,
    position: 'relative',
    width: rootWidth,
    zIndex: 0 // Forming a new stacking context so "z-index" used in children won't pollute
  };
}
