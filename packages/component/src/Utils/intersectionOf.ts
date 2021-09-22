/**
 * Intersects 2 or more arrays and return an array of values which are common to all of them.
 */
export default function intersectionOf<T>(arg0: T[], ...args: T[][]): T[] {
  return args.reduce(
    (interim, arg) =>
      interim.reduce((intersection, item) => {
        arg.includes(item) && intersection.push(item);

        return intersection;
      }, []),
    arg0
  );
}
