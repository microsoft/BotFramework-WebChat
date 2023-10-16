import { type ErrorMessage, string, type StringSchema, value } from 'valibot';

export default function exactString<T extends string>(exactValue: T, errorMessage?: ErrorMessage) {
  return string([value(exactValue, errorMessage)]) as StringSchema<T>;
}
