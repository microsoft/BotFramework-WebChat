export default function marshal(props) {
  return (
    props &&
    Object.keys(props).reduce(
      (nextProps, key) => {
        const { [key]: value } = props;

        if (typeof value === 'function') {
          nextProps[key] = `() => ${value.toString()}`;
          nextProps.__evalKeys.push(key);
        } else {
          nextProps[key] = value;
        }

        return nextProps;
      },
      {
        __evalKeys: []
      }
    )
  );
}
