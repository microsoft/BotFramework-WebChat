// import {
//   any,
//   array,
//   includes,
//   intersect,
//   literal,
//   minLength,
//   object,
//   pipe,
//   readonly,
//   record,
//   string,
//   undefinedable,
//   union,
//   url,
//   type InferOutput
// } from 'valibot';

// const MCPToolWithAppsMetaSchema = pipe(
//   object({
//     ui: pipe(
//       object({
//         resourceUri: pipe(string(), url())
//       }),
//       readonly()
//     )
//   }),
//   readonly()
// );

// type MCPToolWithAppsMeta = InferOutput<typeof MCPToolWithAppsMetaSchema>;

// const MCPToolUIResourceSchema = intersect([
//   object({
//     _meta: object({
//       ui: object({
//         csp: object({
//           connectDomains: array(string()),
//           resourceDomains: array(string())
//         })
//       })
//     }),
//     mimeType: literal('text/html;profile=mcp-app'),
//     uri: pipe(string(), url())
//   }),
//   union([object({ blob: string() }), object({ text: string() })])
// ]);

// type MCPToolUIResource = InferOutput<typeof MCPToolUIResourceSchema>;

// export {
//   MCPAppsResponseEntitySchema,
//   MCPToolUIResourceSchema,
//   MCPToolWithAppsMetaSchema,
//   type MCPAppsResponseEntity,
//   type MCPToolUIResource,
//   type MCPToolWithAppsMeta
// };
