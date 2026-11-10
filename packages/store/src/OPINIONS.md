## Background

State machine design was reactive (event-driven) and linear (array).

The new design is transactional (consistent without locking) and hyperlinking (graph).

## Design direction

- CAP theorem: C and A, but not P
- High-performance: most operations are `O(1)` and some are `O(log n)` regardless of graph or membership size
- Embrace open standard: Schema.org and subset of JSON-LD
- Simple to use: deliberate design choice to minimize work on consumer side
- Minimalist: expose minimal set of API and minimal behaviors
- Hyperlinking: objects are referenced by ID and can be cyclic
- Extensibility: new properties and types can be added at anytime

## Design choice

- CAP theorem
  - Consistency: transactional (clean read), all nodes are always validated
  - High availability: all nodes must be in the graph
- Flattened JSON-LD graph for JSON serializability
- Assume Schema.org but not strictly validated
   - Schema.org is huge spec, we prefer "assume validated by writer" and "assume reader will validate and drop invalid"
- Synchronous transactional edit and one session at a time
- Always plural: singular value is stored in single-item array
- `hasPart` and `isPartOf` must be always inverse of other, validate on commit, offer helper to fix them
- Every node must have a single and unique `@id`, no multiple `@id`
- Every node can has zero-to-many alternate identifiers in `identifier`, for lookup only
- Every node can has multiple `@types` for extensibility reason
- Able to iterate a sorted list of children based on `dateCreated`, can extend upto 3 hardcoded properties

The store is a standard and opinionated JSON-LD graph implementation. The only custom parts are:

- Consistency: a simple and friendly way to auto-inverse `hasPart`/`isPartOf`
- High performance: able to iterate children sorted by `dateCreated`

We intended to keep custom parts minimal to reduce code complexity and learning curve.

## Implementation

- CAP theorem: always consistent and high availability, no partitioning
- Subset of JSON-LD 1.1 specification
- Context is assumed Schema.org to promote interoperability
- All nodes are stored flat in a hashmap, frozen, and plain
- Properties
   - Property name
      - Term (non-IRI property name) must be based on Schema.org
      - Non-Schema.org properties must be named using absolute IRIs
   - Property value
      - Type supported (mixed use in array):
         - `boolean`, `number`, `string`
            - Date time (temporal) should be represented by `string` in ISO format
         - Blank node reference
            - `Exact<{ '@id': string }>`, must not reference the node itself
         - JSON literal
            - `Exact<{ '@type': '@json', '@value': object }>`
            - `@value` behaves exactly the same as `JSON.parse(JSON.stringify(value))`
               - Story: JSON literal is what would be sent over the wire, so what you upsert is what the other side would receive
                  - No surprises: it is the same as the well-known behavior of `JSON.stringify()`, nothing more, nothing less
                  - The value is always copied, the input is never modified
               - `undefined`, function, and symbol
                  - In object, the key is removed, e.g. `{ one: 1, two: undefined }` become `{ one: 1 }`
                  - In array, the element become `null`, e.g. `[1, undefined]` become `[1, null]`, and so do holes in sparse array
                  - As `@value` itself, it is invalid, as `JSON.stringify(undefined)` returns `undefined`, which is not JSON
               - `NaN`, `Infinity`, and `-Infinity` become `null`, `-0` become `0`
               - `toJSON()` is called with the key, e.g. `Date` become an ISO string, `URL` become a string
               - Boxed primitives are unwrapped, e.g. `new Number(1)` become `1`
               - Other objects become plain objects of their own enumerable string-keyed properties
                  - E.g. class instance become a plain object, `Map` and `Set` become `{}`
                  - Symbol keys and non-enumerable properties are removed, getters are called once
               - Arrays only keep elements up to `length`, extra properties are removed
               - Invalid when `JSON.stringify()` would throw: recursion and `BigInt`
               - The only exception: dangerous keys (e.g. `__proto__`, `constructor`, `prototype`) are removed for security reason, while `JSON.parse()` would keep them as own properties
   - Rules
      - Plural form: unless specified, most property values must reside in an array and must have at least 1 item
      - Prohibited `@context` must not be defined, and is assumed "https://schema.org"
      - Required `@id` must be a non-array string which is either an IRI of `https:` or starts with `_:` (blank node identifier)
      - Required `@type` must be `Set<string>` with at least one value
         - Term (non-IRI node type) must be based on Schema.org
         - Non-Schema.org types must be absolute IRIs
      - Optional `dateCreated` must be a non-array `string` in ISO format
      - Optional `identifier` must be `Set<string>` of alternate identifiers, each is either an IRI of `https:` or starts with `_:`
         - Must not contain `@id` of the node
         - Every identifier (either `@id` or alternate identifier) must identify at most one node in the graph
         - Can be changed by upsert, while `@id` is immutable throughout the life of the node
         - Only used by `queryByIdentifier()`, it does not participate in `hasPart`/`isPartOf` nor node references
      - Optional `hasPart` and `isPartOf` must be `Set<Exact<{ '@id': string }>>` (set of blank node identifiers)
         - Appear once in the same membership: a node must not appear twice in the same `hasPart` property
         - Appear in multiple membership: `isPartOf` can contains more than one reference
- Edit must be synchronous and transactional
   - Edit must not be nested into another edit
   - Edit are validated on commit
      - Nodes are not strict validated against Schema.org definition, they are "loosely validated" and "assume validated"
         - Writer must follow Schema.org definition
         - Reader must drop nodes and properties which violate Schema.org definition
   - Upsert
      - Dirty read: updater pass modified version of the node
      - Node edges must be by-reference
      - Nodes are auto-converted to immutable by deep freezing
         - Array and objects are cloned before frozen, inputs are never modified
         - Objects are cloned as plain object
      - All referenced nodes must be upserted in the same transaction
   - Membership (`hasPart`/`isPartOf`) are auto-fixed on commit
      - Adding a reference to `isPartOf` property, will automatically add a back-reference to the `hasPart` on the other side, and vice versa
      - Removing a node from the graph will automatically remove it from `hasPart` and `isPartOf` of the other nodes which reference it
         - Other edges are not checked nor fixed
   - Failed edit will not commit and is abandoned
- Read
   - Read is always clean and consistent
   - Query a single node by ID
   - Query a single node by either `@id` or one of its alternate identifiers via `queryByIdentifier()`, `O(1)`
   - Listeners are notified with `@id` of affected nodes (including deleted nodes), plus their alternate identifiers before and after the change
   - Iterate multiple nodes in the same membership by the ID of the member list node, sorted by `dateCreated` in either ascending or descending order
- Performance characteristics
   - Unless specified, most read and write operations are `O(1)` regardless the size of the graph or membership
   - Changing `identifier` is `O(k)` where `k` is the number of alternate identifiers of the node, an index from alternate identifier to `@id` is updated incrementally
   - Upserting a node with `isPartOf` and `dateCreated` property and being sorted to the middle of the list, the operation will be `O(log n)` where `n` is the size of the membership, where it use skip list to find insertion point
