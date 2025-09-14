// tsup wrongly included typings from private packages marked as `noExternal` or `devDependencies`.
// We cannot direct re-export from private packages without rebuilding their types.
// tsup bug: https://github.com/egoist/tsup/issues/1071

import { withResolvers as withResolvers_ } from '@msinternal/botframework-webchat-base/utils';

type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  reject: (error: unknown) => void;
  resolve: (result: T) => void;
};

const withResolvers = withResolvers_ as <T>() => PromiseWithResolvers<T>;

export default withResolvers;
export { type PromiseWithResolvers };
