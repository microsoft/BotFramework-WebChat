// TODO: [P1] #3953 We should fully type it out.

// Until we fully typed out DirectLineActivity, we need to use "any" here.
// We only know the DirectLineActivity must be a map, and not other primitive types.
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
type DirectLineActivity = Exclude<any, boolean | Function | number | string>;

export default DirectLineActivity;
