export default function mapMap<T>(
  map: { [key: string]: T },
  mapper: (value: T, key: string) => T
): { [key: string]: T } {
  return Object.entries(map).reduce((result, [key, value]) => {
    result[key] = mapper(value, key);

    return result;
  }, {});
}
