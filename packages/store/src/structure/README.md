# Data structure

This folder holds data structure to use in store, primarily opinionated immutable object pattern. The pattern is optimized for read performance.

## Design

### Clean read during transaction

Read is always clean and is not affect by any ongoing transaction.

### `mutate()` and `commit()`

A read-only object (`Map`/`Set`) can be "open as read-write" by calling `mutate()`. The read-write object does not affect the original read-only object.

Calling `commit()` on the read-write object will return a new read-only object.

Multiple mutation session can be opened at the same time since `commit()` is not doing in-place commit.

## Alternative designs

### `edit()` instead of `mutate()`/`commit()`

> Enforcing synchronicity reduce caller complexity by trading restrictions/opinions.

`edit()` enforce synchronous call, while `mutate()`/`commit()` allows asynchronous pattern.

<details>
<summary>Implementation comparison</summary>

```ts
const nextSet = edit(set => {
  set.add('Hello, World!');
  set.delete('Aloha!');
});
```

```ts
const mutable = set.mutate();

mutable.add('Hello, World!');
mutable.delete('Aloha!');

const nextSet = mutable.commit();
```
</details>

### Mutate as class member vs. module-level function

> No new thing on standard class.

`mutableSet = readonlySet.mutate()` vs. `mutableSet = mutate(readonlySet)`.

Callers who doesn't know the module-level function may have called `new Set(readonlySet)`, which works but don't get any performance gain.

### Commit in-place

> Maybe not a good idea because read-only no longer following general understanding of immutability.

After `commit()`, the original read-only object will be updated.

- No multiple mutation sessions
- Current iterations (`keys()`/`values()`) must not be affected by new commit

### Single vs. multiple mutation session

> Single mutation session could ensure caller cannot spend too much memory accidentally.

`mutate()` can only called once. Without `commit()` or `abort()`, it cannot be called again.

`edit()` can enforce single mutation session this better than `mutate()`/`commit()`.
