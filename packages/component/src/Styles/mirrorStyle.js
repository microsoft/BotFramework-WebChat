export default function mirrorStyle(mirrorSelector, styles) {
  const mirrored = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'number' || typeof value === 'string') {
      key = key.replace(/(Left|Right)/u, match => (match === 'Left' ? 'Right' : 'Left'));

      mirrored[key] = value;
    } else {
      mirrored[key] = mirrorStyle('', value);
    }
  }

  return mirrorSelector
    ? {
        [`:not(${mirrorSelector})`]: styles,
        [mirrorSelector]: mirrored
      }
    : mirrored;
}
