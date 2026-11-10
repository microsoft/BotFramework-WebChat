import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { VersionedStorage } from './VersionedStorage.ts';

scenario(
  'VersionedStorage',
  bdd => {
    bdd
      .given('a storage', () => new VersionedStorage(new Map([['one', 1]])))
      .when('mutated and committed', storage => {
        const overlay = storage.mutate();

        overlay.set('two', 2);
        overlay.delete('one');

        return overlay.commit();
      })
      .then('should return a new version with the changes', (_, next) =>
        expect(Array.from(next.toMap())).toEqual([['two', 2]])
      )
      .and('should not modify the base version', storage => {
        expect(Array.from(storage.toMap())).toEqual([['one', 1]]);
        expect(storage.get('one')).toBe(1);
        expect(storage.has('two')).toBe(false);
        expect(storage.size).toBe(1);
      });

    bdd
      .given('a storage', () => new VersionedStorage(new Map([['one', 1]])))
      .when('committed without changes', storage => storage.mutate().commit())
      .then('should return the same version', (storage, next) => expect(next).toBe(storage));

    bdd
      .given('an overlay with changes', () => {
        const overlay = new VersionedStorage(
          new Map([
            ['one', 1],
            ['two', 2]
          ])
        ).mutate();

        overlay.set('one', 100);
        overlay.delete('two');
        overlay.set('three', 3);

        return overlay;
      })
      .when('committed', overlay => overlay.commit())
      .then('should read the committed content from the overlay', overlay => {
        expect(Array.from(overlay.toMap())).toEqual([
          ['one', 100],
          ['three', 3]
        ]);
        expect(overlay.get('one')).toBe(100);
        expect(overlay.has('two')).toBe(false);
        expect(overlay.size).toBe(2);
      })
      .and('should return a version with the changes', (_, next) =>
        expect(Array.from(next.toMap())).toEqual([
          ['one', 100],
          ['three', 3]
        ])
      );

    bdd
      .given('an overlay', () => new VersionedStorage(new Map([['one', 1]])).mutate())
      .when('modified', overlay => {
        overlay.set('two', 2);

        return overlay;
      })
      .then('should read the changes', overlay => {
        expect(overlay.get('one')).toBe(1);
        expect(overlay.get('two')).toBe(2);
        expect(overlay.size).toBe(2);
      });

    bdd
      .given('a committed overlay', () => {
        const overlay = new VersionedStorage(new Map<string, number>()).mutate();

        overlay.commit();

        return overlay;
      })
      .when('modified', overlay => {
        try {
          overlay.set('one', 1);
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .when('committed again', overlay => {
        try {
          overlay.commit();
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)));

    bdd
      .given('three versions committed in a row', () => {
        const v1 = new VersionedStorage(new Map([['value', 1]]));
        const overlay2 = v1.mutate();

        overlay2.set('value', 2);

        const v2 = overlay2.commit();
        const overlay3 = v2.mutate();

        overlay3.set('value', 3);
        overlay3.set('extra', 3);

        return { v1, v2, v3: overlay3.commit() };
      })
      .when('every version is read', versions => versions)
      .then('should read every version as committed', (_, { v1, v2, v3 }) => {
        expect(Array.from(v1.toMap())).toEqual([['value', 1]]);
        expect(Array.from(v2.toMap())).toEqual([['value', 2]]);
        expect(Array.from(v3.toMap())).toEqual([
          ['value', 3],
          ['extra', 3]
        ]);
        expect(v1.get('value')).toBe(1);
        expect(v1.has('extra')).toBe(false);
      });

    bdd
      .given('an older version', () => {
        const v1 = new VersionedStorage(new Map([['value', 1]]));
        const overlay = v1.mutate();

        overlay.set('value', 2);

        return { v1, v2: overlay.commit() };
      })
      .when('a branch is committed on top of the older version', ({ v1 }) => {
        const overlay = v1.mutate();

        overlay.set('value', 3);

        return overlay.commit();
      })
      .then('should have the branch changes', (_, branch) => expect(branch.get('value')).toBe(3))
      .and('should not modify other versions', ({ v1, v2 }) => {
        expect(v1.get('value')).toBe(1);
        expect(v2.get('value')).toBe(2);
      });
  },
  NodeTest
);
