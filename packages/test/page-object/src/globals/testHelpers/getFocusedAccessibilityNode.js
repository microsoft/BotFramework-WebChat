/**
 * Gets the focused node in the accessibility tree, as computed by the browser via Chrome DevTools Protocol.
 *
 * Unlike `document.activeElement`, it sees the focus inside closed shadow trees, e.g. the "play" button of `<audio controls>`.
 *
 * @returns {Promise<object | undefined>} The focused accessibility node, e.g. `{ name: { value: 'play' }, role: { value: 'button' } }`.
 */
export default async function getFocusedAccessibilityNode() {
  const { nodes } = await host.sendAndGetDevToolsCommand('Accessibility.getFullAXTree');

  // The root web area is also marked as focused when the page has the focus.
  return nodes.find(
    ({ properties, role }) =>
      role?.value !== 'RootWebArea' && properties?.some(({ name, value }) => name === 'focused' && value.value)
  );
}
