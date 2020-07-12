export default function mirrorStyle(mirrorSelector, styles) {
  const mirrored = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'number' || typeof value === 'string') {
      key = key.replace(/(^left|^right|Left|Right)/u, match =>
        match === 'Left' ? 'Right' : match === 'left' ? 'right' : match === 'Right' ? 'Left' : 'left'
      );

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
