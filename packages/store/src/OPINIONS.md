## Background

State machine design was reactive (event-driven) and linear (array).

The new design is transactional (consistent without locking) and hyperlinking (graph).

## Design

- High-performance: most operations are `O(1)` and some are `O(log n)` regardless of graph or membership size
- Embrace open standard: Schema.org and subset of JSON-LD
- Simple to use: deliberate design choice to minimize work on consumer side
- Minimalist: expose minimal set of API
- Hyperlinking: objects are referenced by ID and can be cyclic
- Extensibility: new properties and types can be added at anytime

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
            - `@value` must be a JSON serializable object (no `Date`, function, `undefined`, recursion, etc.)
            - For convenience reason
               - Keys in object with `undefined` value will be removed
               - Array with `undefined` element will be removed
   - Rules
      - Plural form: unless specified, most property values must reside in an array and must have at least 1 item
      - Prohibited `@context` must not be defined, and is assumed "https://schema.org"
      - Required `@id` must be a non-array string which is either an IRI of `https:` or starts with `_:` (blank node identifier)
      - Required `@type` must be `Set<string>` with at least one value
         - Term (non-IRI node type) must be based on Schema.org
         - Non-Schema.org types must be absolute IRIs
      - Optional `dateCreated` must be a non-array `string` in ISO format
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
   - Iterate multiple nodes in the same membership by the ID of the member list node, sorted by `dateCreated` in either ascending or descending order
- Performance characteristics
   - Unless specified, most read and write operations are `O(1)` regardless the size of the graph or membership
   - Upserting a node with `isPartOf` and `dateCreated` property and being sorted to the middle of the list, the operation will be `O(log n)` where `n` is the size of the membership, where it use skip list to find insertion point
