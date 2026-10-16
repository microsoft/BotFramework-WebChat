/**
 * Gets the node of the element in the accessibility tree, as computed by the browser via Chrome DevTools Protocol.
 *
 * Useful for asserting what assistive technologies receive, e.g. accessible name and role.
 *
 * @param {Element} element - The element to look up.
 * @returns {Promise<object>} The accessibility node, e.g. `{ name: { value: 'Copy' }, role: { value: 'button' } }`.
 */
export default async function getAccessibilityNode(element) {
  if (!(element instanceof Element)) {
    throw new Error('getAccessibilityNode: "element" must be an instance of Element.');
  }

  // Chrome DevTools Protocol can only reference what an expression can reach.
  // Expose the element temporarily under a unique key, instead of marking it in the DOM, so the accessibility tree is not affected.
  // A map allows concurrent calls.
  const key = Math.random().toString(36).slice(2);
  const targets = (window.__getAccessibilityNodeTargets__ = window.__getAccessibilityNodeTargets__ || new Map());

  targets.set(key, element);

  try {
    const {
      result: { objectId }
    } = await host.sendAndGetDevToolsCommand('Runtime.evaluate', {
      expression: `window.__getAccessibilityNodeTargets__.get(${JSON.stringify(key)})`
    });

    const {
      node: { backendNodeId }
    } = await host.sendAndGetDevToolsCommand('DOM.describeNode', { objectId });

    const { nodes } = await host.sendAndGetDevToolsCommand('Accessibility.getPartialAXTree', {
      backendNodeId,
      fetchRelatives: false
    });

    return nodes.find(node => node.backendDOMNodeId === backendNodeId) || nodes[0];
  } finally {
    targets.delete(key);
  }
}
