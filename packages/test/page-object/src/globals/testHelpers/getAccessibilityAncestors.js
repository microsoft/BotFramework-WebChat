import getAccessibilityNode from './getAccessibilityNode';

/**
 * Gets the ancestors of the element in the accessibility tree, as computed by the browser via Chrome DevTools Protocol.
 *
 * Useful for asserting the context assistive technologies announce with the element, e.g. "1 of 1" for an item of a list.
 * Nodes ignored by the browser are skipped, as assistive technologies do.
 *
 * @param {Element} element - The element to look up.
 * @returns {Promise<object[]>} The accessibility nodes of the ancestors, from the parent up to the root, e.g. `[{ role: { value: 'listitem' } }, { role: { value: 'list' } }, ...]`.
 */
export default async function getAccessibilityAncestors(element) {
  const { backendDOMNodeId } = await getAccessibilityNode(element);

  // With relatives, the partial tree includes all ancestors up to the root.
  const { nodes } = await host.sendAndGetDevToolsCommand('Accessibility.getPartialAXTree', {
    backendNodeId: backendDOMNodeId,
    fetchRelatives: true
  });

  const ancestors = [];
  const nodesById = new Map(nodes.map(node => [node.nodeId, node]));

  for (
    let ancestor = nodesById.get(nodes.find(node => node.backendDOMNodeId === backendDOMNodeId)?.parentId);
    ancestor;
    ancestor = nodesById.get(ancestor.parentId)
  ) {
    ancestors.push(ancestor);
  }

  return ancestors.filter(({ ignored }) => !ignored);
}
