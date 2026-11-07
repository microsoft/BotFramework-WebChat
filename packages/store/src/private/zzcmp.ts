// @ts-nocheck
import { safeParse } from 'valibot';
import { jsonValueSchema } from '../node/JSONValue.ts';
class Point { x = 1; }
const cases = {
  NaN: () => NaN, Infinity: () => Infinity, '-0': () => -0, '[NaN]': () => [NaN], '{a:NaN}': () => ({ a: NaN }),
  Date: () => new Date(0), '{d:Date}': () => ({ d: new Date(0) }), Map: () => new Map([[1, 1]]), Set: () => new Set([1]),
  URL: () => new URL('https://example.com/'), Point: () => new Point(), toJSON: () => ({ toJSON: () => 'Hello' }),
  'toJSON key': () => ({ a: { toJSON: k => k } }), '{f:fn}': () => ({ f: () => 1 }), '[fn]': () => [() => 1],
  '{s:sym}': () => ({ s: Symbol('x') }), '[sym]': () => [Symbol('x')], 'new Number': () => new Number(1), 'new String': () => ({ s: new String('x') }),
  'new Boolean': () => [new Boolean(false)], 'symbol key': () => ({ [Symbol('x')]: 1, a: 1 }),
  'nonenum': () => Object.defineProperty({ a: 1 }, 'b', { value: 2, enumerable: false }), getter: () => ({ get a() { return 1; } }),
  'null proto': () => Object.assign(Object.create(null), { a: 1 }), 'array extra prop': () => Object.assign([1], { x: 1 })
};
for (const [name, make] of Object.entries(cases)) {
  let expected; try { expected = JSON.parse(JSON.stringify(make())); } catch (e) { expected = `throws`; }
  const r = safeParse(jsonValueSchema, make());
  const actual = r.success ? r.output : 'throws';
  const same = JSON.stringify(actual) === JSON.stringify(expected) && Object.is(actual, expected) === Object.is(actual, expected) && !(Object.is(expected, 0) && Object.is(actual, -0));
  console.log(same ? 'OK  ' : 'DIFF', name, '| expected', JSON.stringify(expected), '| actual', r.success ? (Object.is(actual, -0) ? '-0' : JSON.stringify(actual)) : 'throws');
}
