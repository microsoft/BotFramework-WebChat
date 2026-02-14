import {
  array,
  boolean,
  isoDateTime,
  literal,
  number,
  object,
  picklist,
  pipe,
  readonly,
  record,
  string,
  undefinedable,
  union,
  unknown,
  type InferInput
} from 'valibot';

const MCPCallToolResultSchema = pipe(
  object({
    _meta: undefinedable(
      object({
        progressToken: undefinedable(union([string(), number()])),
        'io.modelcontextprotocol/related-task': undefinedable(
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
            annotations: undefinedable(
              object({
                audience: undefinedable(array(picklist(['user', 'assistant']))),
                priority: undefinedable(number()),
                lastModified: undefinedable(pipe(string(), isoDateTime()))
              })
            ),
            _meta: undefinedable(record(string(), unknown()))
          }),
          object({
            type: literal('image'),
            data: string(),
            mimeType: string(),
            annotations: undefinedable(
              object({
                audience: undefinedable(array(picklist(['user', 'assistant']))),
                priority: undefinedable(number()),
                lastModified: undefinedable(pipe(string(), isoDateTime()))
              })
            ),
            _meta: undefinedable(record(string(), unknown()))
          }),
          object({
            type: literal('audio'),
            data: string(),
            mimeType: string(),
            annotations: undefinedable(
              object({
                audience: undefinedable(array(picklist(['user', 'assistant']))),
                priority: undefinedable(number()),
                lastModified: undefinedable(pipe(string(), isoDateTime()))
              })
            ),
            _meta: undefinedable(record(string(), unknown()))
          }),
          object({
            uri: string(),
            description: undefinedable(string()),
            mimeType: undefinedable(string()),
            annotations: undefinedable(
              object({
                audience: undefinedable(array(picklist(['user', 'assistant']))),
                priority: undefinedable(number()),
                lastModified: undefinedable(pipe(string(), isoDateTime()))
              })
            ),
            _meta: undefinedable(record(string(), unknown())),
            icons: undefinedable(
              array(
                object({
                  src: string(),
                  mimeType: undefinedable(string()),
                  sizes: undefinedable(array(string())),
                  theme: undefinedable(picklist(['light', 'dark']))
                })
              )
            ),
            name: string(),
            title: undefinedable(string()),
            type: literal('resource_link')
          }),
          object({
            type: literal('resource'),
            resource: union([
              object({
                uri: string(),
                mimeType: undefinedable(string()),
                _meta: undefinedable(record(string(), unknown())),
                text: string()
              }),
              object({
                uri: string(),
                mimeType: undefinedable(string()),
                _meta: undefinedable(record(string(), unknown())),
                blob: string()
              })
            ]),
            annotations: undefinedable(
              object({
                audience: undefinedable(array(picklist(['user', 'assistant']))),
                priority: undefinedable(number()),
                lastModified: undefinedable(pipe(string(), isoDateTime()))
              })
            ),
            _meta: undefinedable(record(string(), unknown()))
          })
        ])
      )
    ),
    structuredContent: undefinedable(record(string(), unknown())),
    isError: undefinedable(boolean())
  }),
  readonly()
);

type MCPCallToolResult = InferInput<typeof MCPCallToolResultSchema>;

export { MCPCallToolResultSchema, type MCPCallToolResult };
