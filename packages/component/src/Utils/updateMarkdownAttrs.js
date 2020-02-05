import updateIn from 'simple-update-in';

// function fromEntries(entries) {
//   return entries.reduce((map, [name, value]) => ({ ...map, [name]: value }), {});
// }

export default function updateMarkdownItAttrs(token, updater) {
  return updateIn(token, ['attrs'], attrs => {
    const map = Object.fromEntries(attrs);
    // const map = attrs.reduce((map, [name, value]) => ({ ...map, [name]: value }), {});
    const nextMap = updater(map);

    return Object.keys(nextMap).reduce((attrs, key) => [...attrs, [key, nextMap[key]]], []);
  });
}
