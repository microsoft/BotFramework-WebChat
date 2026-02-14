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
  undefinedable,
  url,
  type InferOutput
} from 'valibot';
import { MCPCallToolResultSchema } from './MCPCallToolResult';

const MessageEntityForMCPAppSchema = pipe(
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
            includes('urn:microsoft:webchat:model-context-protocol:call-tool'),
            readonly()
          ),
          name: string(),
          url: pipe(string(), url())
        })
      ),
      minLength(1),
      readonly()
    ),

    // TODO: Maybe a valibot.json() but there is no json() right now.
    'urn:microsoft:webchat:model-context-protocol:call-tool:input': undefinedable(record(string(), any())),

    // TODO: Should we convert from zod?
    // __tests__/html2/modelContextProtocol/node_modules/@modelcontextprotocol/sdk/dist/esm/types.d.ts:L2491
    'urn:microsoft:webchat:model-context-protocol:call-tool:result': MCPCallToolResultSchema
  }),
  readonly()
);

type MessageEntityForMCPApp = InferOutput<typeof MessageEntityForMCPAppSchema>;

export { MessageEntityForMCPAppSchema, type MessageEntityForMCPApp };
