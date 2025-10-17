import { custom, function_, safeParse, type CustomIssue, type CustomSchema, type ErrorMessage } from 'valibot';

function customFunction(): CustomSchema<(...args: any[]) => any, undefined>;

function customFunction<T extends (...args: any[]) => any>(): CustomSchema<T, undefined>;

function customFunction<
  T extends (...args: any[]) => any,
  const TMessage extends ErrorMessage<CustomIssue> | undefined = ErrorMessage<CustomIssue> | undefined
>(message?: TMessage): CustomSchema<T, TMessage>;

function customFunction<T extends (...args: any[]) => any>() {
  return custom<T>(value => safeParse(function_(), value).success);
}

export default customFunction;
