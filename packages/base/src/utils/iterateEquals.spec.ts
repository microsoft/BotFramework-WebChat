import { expect, test } from '@jest/globals';
import iterateEquals from './iterateEquals';

test('comparing empty arrays', () => expect(iterateEquals([].values(), [].values())).toBe(true));
test('comparing different arrays', () => expect(iterateEquals([1].values(), [2].values())).toBe(false));
test('comparing bigger array to smaller array', () => expect(iterateEquals([1, 2].values(), [1].values())).toBe(false));
test('comparing smaller array to bigger array', () => expect(iterateEquals([1].values(), [1, 2].values())).toBe(false));
test('comparing non-empty array to empty array', () => expect(iterateEquals([1].values(), [].values())).toBe(false));
test('comparing empty array to non-empty array', () => expect(iterateEquals([].values(), [1].values())).toBe(false));
