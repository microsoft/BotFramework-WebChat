import { McpUiDisplayMode } from '@modelcontextprotocol/ext-apps/app-bridge';
import React, { ReactNode, useImperativeHandle, useState } from 'react';
import { never, object, optional, parse, type InferOutput } from 'valibot';
import { MessageEntityForMCPAppSchema } from './types/MessageEntityForMCPApp.js';
import { useMCPClient } from './useMCPClient.js';

const MCPAppActivityPropsSchema = object({
  children: optional(never()),
  entity: MessageEntityForMCPAppSchema
});
type MCPAppActivityProps = { children?: never } & InferOutput<typeof MCPAppActivityPropsSchema>;

function MCPAppShell(props: { mode: McpUiDisplayMode; children?: ReactNode }) {
  const { children, mode } = props;

  return (
    <div>
      <div>
        <h1>MCP App</h1>
      </div>

      <div
        {...(mode === 'fullscreen' && {
          role: 'dialog',
          'aria-modal': 'true',
          style: {
            position: 'fixed',
            inset: 0,
            zIndex: 2147483646,
            background: 'rgba(0,0,0,0.55)'
          }
        })}
      >
        {children}
      </div>
    </div>
  );
}

const sharedIframeStyle: Map<McpUiDisplayMode, React.CSSProperties> = new Map([
  [
    'inline',
    {
      display: 'block',
      border: 'none',
      background: 'transparent',
      width: '100%',
      height: 400
    }
  ],
  [
    'fullscreen',
    {
      display: 'block',
      border: 'none',
      background: 'transparent',
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  ]
]);

interface IframeHandle {
  iframe: HTMLIFrameElement | null;
}

const MCPAppActivity = React.forwardRef<IframeHandle, MCPAppActivityProps>((props, ref) => {
  const { entity } = parse(MCPAppActivityPropsSchema, props);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  const toolName = entity.isPartOf[0]!.name;

  const { mode } = useMCPClient(iframe, toolName, entity);

  useImperativeHandle(ref, () => ({ iframe }), [iframe]);

  return (
    <MCPAppShell mode={mode}>
      <iframe key={toolName} ref={setIframe} title="MCP App" style={sharedIframeStyle.get(mode)} />
    </MCPAppShell>
  );
});

MCPAppActivity.displayName = 'MCPAppActivity';

export default MCPAppActivity;
export { MCPAppActivityPropsSchema };
export type { MCPAppActivityProps };
