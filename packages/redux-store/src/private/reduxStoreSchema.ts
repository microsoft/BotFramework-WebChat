import { type Store } from 'redux';
import { custom, function_, is, object } from 'valibot';

const reduxStoreSchema = custom<Store>(
  value =>
    is(
      object({
        dispatch: custom<Store['dispatch']>(value => is(function_(), value)),
        getState: custom<Store['getState']>(value => is(function_(), value)),
        subscribe: custom<Store['subscribe']>(value => is(function_(), value))
      }),
      value
    )
);

export default reduxStoreSchema;
