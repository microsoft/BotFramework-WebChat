export default function mapMap(map, mapper) {
  return Object.keys(map).reduce((result, key) => {
    result[key] = mapper(map[key], key);

    return result;
  }, {});
}
