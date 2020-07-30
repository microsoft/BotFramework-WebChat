export default function intersectionOf(arg0, ...args) {
  return args.reduce(
    (interim, arg) =>
      interim.reduce((intersection, item) => {
        arg.includes(item) && intersection.push(item);

        return intersection;
      }, []),
    arg0
  );
}
