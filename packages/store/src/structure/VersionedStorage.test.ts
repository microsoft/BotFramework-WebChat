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

scenario(
  'VersionedStorage iteration order',
  bdd => {
    bdd
      .given(
        'a storage',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2]
            ])
          )
      )
      .when('a key is deleted and committed', storage => {
        const overlay = storage.mutate();

        overlay.delete('a');

        return overlay.commit();
      })
      .then('the base version should keep its original order', storage =>
        expect(Array.from(storage.toMap())).toEqual([
          ['a', 1],
          ['b', 2]
        ])
      );

    bdd
      .given(
        'a storage',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2],
              ['c', 3]
            ])
          )
      )
      .when('keys are deleted across multiple commits', storage => {
        const overlay1 = storage.mutate();

        overlay1.delete('a');

        const overlay2 = overlay1.commit().mutate();

        overlay2.delete('b');

        return overlay2.commit();
      })
      .then('the base version should keep its original order', storage =>
        expect(Array.from(storage.toMap())).toEqual([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ])
      );

    bdd
      .given(
        'an overlay',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2]
            ])
          )
      )
      .when('a base key is deleted then set again in the same overlay', storage => {
        const overlay = storage.mutate();

        overlay.delete('a');
        overlay.set('a', 100);

        return overlay;
      })
      .then('the overlay should move the key to the end', (_, overlay) =>
        expect(Array.from(overlay.toMap())).toEqual([
          ['b', 2],
          ['a', 100]
        ])
      )
      .and('the committed version should move the key to the end', (_, overlay) =>
        expect(Array.from(overlay.commit().toMap())).toEqual([
          ['b', 2],
          ['a', 100]
        ])
      );
  },
  NodeTest
);

/** Takes the first key from the iterator, modifies the map, then iterates the rest. */
function iterateWithChange(
  keys: Iterator<string>,
  change: () => void
): { readonly first: string | undefined; readonly rest: readonly string[] } {
  const first = keys.next().value;

  change();

  const rest: string[] = [];

  for (let result = keys.next(); !result.done; result = keys.next()) {
    rest.push(result.value);
  }

  return Object.freeze({ first, rest: Object.freeze(rest) });
}

scenario(
  'Overlay iterator should keep its position across commit',
  bdd => {
    bdd
      .given(
        'an overlay of [a, b, c]',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2],
              ['c', 3]
            ])
          )
      )
      .when('the visited key is deleted then committed while iterating keys()', storage => {
        const overlay = storage.mutate();

        return iterateWithChange(overlay.keys(), () => {
          overlay.delete('a');
          overlay.commit();
        });
      })
      .then('should visit the rest of the keys', (_, { first, rest }) => {
        expect(first).toBe('a');
        expect(rest).toEqual(['b', 'c']);
      })
      .and('should iterate the same as native Map', (storage, actual) => {
        const map = new Map(storage.toMap());

        expect(actual).toEqual(iterateWithChange(map.keys(), () => map.delete('a')));
      });

    bdd
      .given(
        'an overlay of [a, b, c]',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2],
              ['c', 3]
            ])
          )
      )
      .when('the visited key is deleted, set again, then committed while iterating keys()', storage => {
        const overlay = storage.mutate();

        return iterateWithChange(overlay.keys(), () => {
          overlay.delete('a');
          overlay.set('a', 100);
          overlay.commit();
        });
      })
      .then('should visit the rest of the keys, then the reinserted key', (_, { first, rest }) => {
        expect(first).toBe('a');
        expect(rest).toEqual(['b', 'c', 'a']);
      })
      .and('should iterate the same as native Map', (storage, actual) => {
        const map = new Map(storage.toMap());

        expect(actual).toEqual(
          iterateWithChange(map.keys(), () => {
            map.delete('a');
            map.set('a', 100);
          })
        );
      });
  },
  NodeTest
);

scenario(
  'VersionedStorage without preserving order',
  bdd => {
    bdd
      .given('a storage of [a, b, c] with a deleted key', () => {
        const storage = new VersionedStorage(
          new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ]),
          { preserveOrder: false }
        );

        const overlay = storage.mutate();

        overlay.delete('a');

        return Object.freeze({ storage, withoutA: overlay.commit() });
      })
      .when('the deleted key is set again and committed', ({ withoutA }) => {
        const overlay = withoutA.mutate();

        overlay.set('a', 100);

        return overlay.commit();
      })
      .then('should not preserve order', ({ withoutA }) => expect(withoutA.preserveOrder).toBe(false))
      .and('should write the key in place without moving it to the end', (_, next) =>
        expect(Array.from(next.toMap())).toEqual([
          ['a', 100],
          ['b', 2],
          ['c', 3]
        ])
      )
      .and('should read the key', (_, next) => {
        expect(next.get('a')).toBe(100);
        expect(next.has('a')).toBe(true);
        expect(next.size).toBe(3);
      })
      .and('should keep older versions intact', ({ storage, withoutA }) => {
        expect(Array.from(storage.toMap())).toEqual([
          ['a', 1],
          ['b', 2],
          ['c', 3]
        ]);
        expect(Array.from(withoutA.toMap())).toEqual([
          ['b', 2],
          ['c', 3]
        ]);
        expect(withoutA.has('a')).toBe(false);
        expect(withoutA.size).toBe(2);
      });

    bdd
      .given(
        'a storage of [a, b]',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2]
            ]),
            { preserveOrder: false }
          )
      )
      .when('a key is deleted then set again in the same overlay', storage => {
        const overlay = storage.mutate();

        overlay.delete('a');
        overlay.set('a', 100);

        return overlay;
      })
      .then('the overlay should keep the key in place', (_, overlay) => {
        expect(Array.from(overlay.keys())).toEqual(['a', 'b']);
        expect(Array.from(overlay.toMap())).toEqual([
          ['a', 100],
          ['b', 2]
        ]);
      })
      .and('the committed version should keep the key in place', (_, overlay) => {
        const next = overlay.commit();

        expect(Array.from(next.toMap())).toEqual([
          ['a', 100],
          ['b', 2]
        ]);
        expect(next.preserveOrder).toBe(false);
      });

    bdd
      .given('a storage which a key is deleted and set again many times', () => {
        const versions: VersionedStorage<string, number>[] = [
          new VersionedStorage(
            new Map([
              ['a', 0],
              ['b', 0]
            ]),
            { preserveOrder: false }
          )
        ];

        for (let index = 1; index <= 100; index++) {
          const overlay = versions.at(-1)!.mutate();

          index % 2 ? overlay.delete('a') : overlay.set('a', index);

          versions.push(overlay.commit());
        }

        return versions;
      })
      .when('every version is read', versions => versions.map(version => Array.from(version.entries())))
      .then('every version should have its own content', (_, entries) =>
        entries.forEach((entry, index) =>
          expect(entry).toEqual(
            index % 2
              ? [['b', 0]]
              : [
                  ['a', index],
                  ['b', 0]
                ]
          )
        )
      )
      .and('every version should have its own size', versions =>
        versions.forEach((version, index) => expect(version.size).toBe(index % 2 ? 1 : 2))
      );

    bdd
      .given(
        'a storage of [a, b, c]',
        () =>
          new VersionedStorage(
            new Map([
              ['a', 1],
              ['b', 2],
              ['c', 3]
            ]),
            { preserveOrder: false }
          )
      )
      .when('a key is deleted and set again in another commit while iterating the head', storage => {
        const overlay1 = storage.mutate();

        overlay1.delete('b');

        const withoutB = overlay1.commit();

        return Object.freeze({
          withoutB,
          ...iterateWithChange(withoutB.keys(), () => {
            const overlay2 = withoutB.mutate();

            overlay2.set('b', 200);
            overlay2.delete('c');
            overlay2.commit();
          })
        });
      })
      .then('should iterate the content of the version being iterated', (_, { first, rest }) => {
        expect(first).toBe('a');
        expect(rest).toEqual(['c']);
      });
  },
  NodeTest
);
