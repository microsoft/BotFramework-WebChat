/**
 * Intersects 2 or more arrays and return an array of values which are common to all of them.
 */
export default function intersectionOf<T>(arg0: readonly T[], ...args: readonly (readonly T[])[]): T[] {
  return args.reduce<T[]>(
    (interim: T[], arg: readonly T[]) =>
      interim.reduce((intersection: T[], item: T) => {
        arg.includes(item) && intersection.push(item);

        return intersection;
      }, []),
    [...arg0]
  );
}
