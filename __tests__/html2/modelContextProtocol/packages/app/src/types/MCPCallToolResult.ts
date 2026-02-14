import {
  array,
  boolean,
  isoDateTime,
  literal,
  looseObject,
  number,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  record,
  string,
  union,
  unknown,
  type InferInput
} from 'valibot';

const MCPCallToolResultSchema = pipe(
  looseObject({
    _meta: optional(
      looseObject({
        progressToken: optional(union([string(), number()])),
        'io.modelcontextprotocol/related-task': optional(
          object({
            taskId: string()
          })
        )
      })
    ),
    content: pipe(
      array(
        union([
          object({
            type: literal('text'),
            text: string(),
            annotations: optional(
              object({
                audience: optional(array(picklist(['user', 'assistant']))),
                priority: optional(number()),
                lastModified: optional(pipe(string(), isoDateTime()))
              })
            ),
            _meta: optional(record(string(), unknown()))
          }),
          object({
            type: literal('image'),
            data: string(),
            mimeType: string(),
            annotations: optional(
              object({
                audience: optional(array(picklist(['user', 'assistant']))),
                priority: optional(number()),
                lastModified: optional(pipe(string(), isoDateTime()))
              })
            ),
            _meta: optional(record(string(), unknown()))
          }),
          object({
            type: literal('audio'),
            data: string(),
            mimeType: string(),
            annotations: optional(
              object({
                audience: optional(array(picklist(['user', 'assistant']))),
                priority: optional(number()),
                lastModified: optional(pipe(string(), isoDateTime()))
              })
            ),
            _meta: optional(record(string(), unknown()))
          }),
          object({
            uri: string(),
            description: optional(string()),
            mimeType: optional(string()),
            annotations: optional(
              object({
                audience: optional(array(picklist(['user', 'assistant']))),
                priority: optional(number()),
                lastModified: optional(pipe(string(), isoDateTime()))
              })
            ),
            _meta: optional(record(string(), unknown())),
            icons: optional(
              array(
                object({
                  src: string(),
                  mimeType: optional(string()),
                  sizes: optional(array(string())),
                  theme: optional(picklist(['light', 'dark']))
                })
              )
            ),
            name: string(),
            title: optional(string()),
            type: literal('resource_link')
          }),
          object({
            type: literal('resource'),
            resource: union([
              object({
                uri: string(),
                mimeType: optional(string()),
                _meta: optional(record(string(), unknown())),
                text: string()
              }),
              object({
                uri: string(),
                mimeType: optional(string()),
                _meta: optional(record(string(), unknown())),
                blob: string()
              })
            ]),
            annotations: optional(
              object({
                audience: optional(array(picklist(['user', 'assistant']))),
                priority: optional(number()),
                lastModified: optional(pipe(string(), isoDateTime()))
              })
            ),
            _meta: optional(record(string(), unknown()))
          })
        ])
      )
    ),
    structuredContent: optional(record(string(), unknown())),
    isError: optional(boolean())
  }),
  readonly()
);

type MCPCallToolResult = InferInput<typeof MCPCallToolResultSchema>;

export { MCPCallToolResultSchema, type MCPCallToolResult };
