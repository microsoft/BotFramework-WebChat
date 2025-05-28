import { type Store } from 'redux';
import { custom, function_, object, safeParse } from 'valibot';

const reduxStoreSchema = custom<Store>(
  value =>
    safeParse(
      object({
        dispatch: custom<Store['dispatch']>(value => safeParse(function_(), value).success),
        getState: custom<Store['getState']>(value => safeParse(function_(), value).success),
        subscribe: custom<Store['subscribe']>(value => safeParse(function_(), value).success)
      }),
      value
    ).success
);

export default reduxStoreSchema;
