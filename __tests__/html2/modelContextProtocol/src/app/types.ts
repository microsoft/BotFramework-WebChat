import {
  any,
  array,
  includes,
  literal,
  minLength,
  object,
  pipe,
  readonly,
  record,
  string,
  url,
  type InferOutput
} from 'valibot';

const MCPAppsResponseEntitySchema = pipe(
  object({
    '@id': literal(''),
    '@type': literal('Message'),
    additionalType: pipe(array(string()), includes('WebPage'), readonly()),
    encodingFormat: literal('text/html;profile=mcp-app'),
    isPartOf: pipe(
      array(
        object({
          '@type': pipe(
            array(string()),
            includes('HowToTool'),
            includes('urn:microsoft:webchat:model-context-protocol:tool'),
            readonly()
          ),
          name: string(),
          url: pipe(string(), url())
        })
      ),
      minLength(1),
      readonly()
    ),
    'urn:microsoft:webchat:model-context-protocol:input': record(string(), any()) // TODO: Maybe a json() but there is no json() right now.
    // text: string()
  }),
  readonly()
);

type MCPAppsResponseEntity = InferOutput<typeof MCPAppsResponseEntitySchema>;

const MCPToolWithAppsMetaSchema = pipe(
  object({
    ui: pipe(
      object({
        resourceUri: pipe(string(), url())
      }),
      readonly()
    )
  }),
  readonly()
);

type MCPToolWithAppsMeta = InferOutput<typeof MCPToolWithAppsMetaSchema>;

const MCPAppsResourceSchema = object({
  _meta: object({
    ui: object({
      csp: object({
        connectDomains: array(string()),
        resourceDomains: array(string())
      })
    })
  }),
  mimeType: literal('text/html;profile=mcp-app'),
  text: string(),
  uri: pipe(string(), url())
});

type MCPAppsResource = InferOutput<typeof MCPAppsResourceSchema>;

export {
  MCPAppsResourceSchema,
  MCPAppsResponseEntitySchema,
  MCPToolWithAppsMetaSchema,
  type MCPAppsResource,
  type MCPAppsResponseEntity,
  type MCPToolWithAppsMeta
};
