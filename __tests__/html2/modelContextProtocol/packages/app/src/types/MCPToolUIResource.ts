import { array, intersect, literal, object, pipe, string, union, url, type InferOutput } from 'valibot';

const MCPToolUIResourceSchema = intersect([
  object({
    _meta: object({
      ui: object({
        csp: object({
          connectDomains: array(string()),
          resourceDomains: array(string())
        })
      })
    }),
    mimeType: literal('text/html;profile=mcp-app'),
    uri: pipe(string(), url())
  }),
  union([object({ blob: string() }), object({ text: string() })])
]);

type MCPToolUIResource = InferOutput<typeof MCPToolUIResourceSchema>;

export { MCPToolUIResourceSchema, type MCPToolUIResource };
