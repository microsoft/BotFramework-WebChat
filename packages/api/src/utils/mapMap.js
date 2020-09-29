export default function mapMap(map, mapper) {
  return Object.entries(map).reduce((result, [key, value]) => {
    result[key] = mapper(value, key);

    return result;
  }, {});
}
