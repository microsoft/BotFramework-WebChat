Put our opinions into the node.

The opinions are targeted around a few principles:

- Simplifying downstream logics
   - Must have `@id`: every node in the graph must be identifiable
   - Uniform getter/setter: every property value is an array, except `@context` and `@id`
   - Unique typing: node reference must be `{ "@id": string }` to reduce confusion with plain string
   - Support multiple types: every `@type` must be an array of string
   - Reduce confusion: property value with empty array and `null` is removed
      - `[]` and `null` are same as if the property is removed
   - Flattened: property values must be non-null literals, node reference, or JSON literals
      - Any array containing `null` is not supported and will throw unless it is JSON literal, as it is likely a bug in code
   - JSON literals will have boxing kept: `{ '@type': '@json', '@value': JSONValue }`
      - `@value` could be null, if unwrapped, will be confusing as we removed nulls
   - Do not handle full JSON-LD spec: `@context` is an opaque string and its schema is not honored
   - Node reference only has `@id` and it should not contain `@type`
   - Reduce confusion: node reference must not appear at the root of the flattened graph, they are semantically empty
- Auto-linking for Schema.org: `hasPart` and `isPartOf` are auto-inversed
- Keep its root: every node is compliant to JSON-LD, understood by standard parsers
- Debuggability: must have at least one `@type`

@param node
@returns An opinionated node object which conforms to JSON-LD specification.
