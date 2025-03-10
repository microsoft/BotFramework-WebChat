/** Walks a DOM tree in depth-first search manner. */
export default function* depthFirstWalk(element, walker) {
  const nodes = [].slice.call(element.childNodes);

  while (nodes.length) {
    const node = nodes.shift();

    if (walker.call(element, node)) {
      yield node;
    }

    nodes.unshift(...[].slice.call(node.childNodes));
  }
}
