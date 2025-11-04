export default function isOfType(nodeObject: { '@type': readonly string[] | string }, type: string): boolean {
  const types = nodeObject['@type'];

  return typeof types === 'string' ? types === type : !!types && types.includes(type);
}
