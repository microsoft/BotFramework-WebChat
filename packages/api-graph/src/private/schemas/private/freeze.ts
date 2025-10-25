import { transform } from 'valibot';

/**
 * Valibot pipe action to freeze the array/object. The value will not be cloned before freeze.
 *
 * The `readonly()` pipe action in Valibot does not freeze.
 *
 * @returns
 */
export default function freeze<T>() {
  return transform<T, Readonly<T>>(value => Object.freeze(value));
}
