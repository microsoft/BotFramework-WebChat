export default function visitOnce<T>(): (value: T) => boolean {
  const visited = new Set<T>();

  return (value: T) => {
    if (visited.has(value)) {
      return false;
    }

    visited.add(value);

    return true;
  };
}
