import depthFirstWalk from './depthFirstWalk';

export default function getAllTextContents(element) {
  return Array.from(depthFirstWalk(element, node => node.nodeType === Node.TEXT_NODE)).map(
    ({ textContent }) => textContent
  );
}
