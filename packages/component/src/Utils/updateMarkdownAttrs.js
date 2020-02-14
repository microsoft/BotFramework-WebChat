import updateIn from 'simple-update-in';

export default function updateMarkdownItAttrs(token, updater) {
  return updateIn(token, ['attrs'], attrs => {
    const map = Object.fromEntries(attrs);
    const nextMap = updater(map);

    return Object.entries(nextMap);
  });
}
