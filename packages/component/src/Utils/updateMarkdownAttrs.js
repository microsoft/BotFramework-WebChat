import updateIn from 'simple-update-in';

export default function updateMarkdownItAttrs(token, updater) {
  return updateIn(token, ['attrs'], attrs => {
    const map = attrs.reduce((map, [name, value]) => ({ ...map, [name]: value }), {});
    const nextMap = updater(map);

    return Object.keys(nextMap).reduce((attrs, key) => [...attrs, [key, nextMap[key]]], []);
  });
}
