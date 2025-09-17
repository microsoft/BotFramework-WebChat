import React, { memo, useEffect, useMemo, type ReactNode } from 'react';

import { type AssetName } from './AssetName';
import Context, { type ContextType } from './private/Context';

type AssetComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const SLIDING_DOTS_SVG_STRING =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="20" viewBox="0 0 400 20"><defs><linearGradient id="a" x1="0" x2="100%" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%"><animate attributeName="stop-color" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="#ad5ae1;#ad5ae1;#0E94E1;#0E94E1;#669fc2;#669fc2;#ad5ae1"/></stop><stop offset="50%"><animate attributeName="stop-color" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="#e9618d;#e9618d;#57AB82;#57AB82;#6377e0;#6377e0;#e9618d"/></stop><stop offset="100%"><animate attributeName="stop-color" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="#fd9e5f;#fd9e5f;#C6C225;#C6C225;#9b80ec;#9b80ec;#fd9e5f"/></stop></linearGradient></defs><g fill="url(#a)"><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.5;0.66;1" repeatCount="indefinite" values="26;26;0;0"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;1" repeatCount="indefinite" values="20;20;30;30;20;20"/><animate attributeName="opacity" dur="2s" keyTimes="0;0.5;0.66;1" repeatCount="indefinite" values="1;1;0;0"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="62;62;72;72;26;26;0"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="104;104;20;20;70;70;20"/><animate attributeName="opacity" dur="2s" keyTimes="0;0.8;1" repeatCount="indefinite" values="1;1;0"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="182;182;108;108;112;112;26"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;1" repeatCount="indefinite" values="20;20;60;60;20;20"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="218;218;184;184;148;148;62"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="60;60;80;80;40;40;104"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="294;294;280;280;204;204;182"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="40;40;20;20;80;80;20"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="350;350;316;316;300;300;218"/><animate attributeName="width" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="20;20;60;60;20;20;60"/></rect><rect height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="386;386;392;392;336;336;294"/><animate attributeName="width" dur="2s" keyTimes="0;0.5;0.66;1" repeatCount="indefinite" values="20;20;40;40"/><animate attributeName="opacity" dur="2s" keyTimes="0;0.5;0.66;1" repeatCount="indefinite" values="0;0;1;1"/></rect><rect width="20" height="20" rx="10"><animate attributeName="x" dur="2s" keyTimes="0;0.2;0.33;0.5;0.66;0.8;1" repeatCount="indefinite" values="422;422;428;428;392;392;350"/><animate attributeName="opacity" dur="2s" keyTimes="0;0.8;1" repeatCount="indefinite" values="0;0;1"/></rect></g></svg>';

const AssetComposer = memo(({ children }: AssetComposerProps) => {
  const slidingDotsURL = useMemo(
    // Content is hardcoded.
    // eslint-disable-next-line no-restricted-properties
    () => URL.createObjectURL(new Blob([SLIDING_DOTS_SVG_STRING], { type: 'image/svg+xml' })),
    []
  );

  useEffect(() => () => URL.revokeObjectURL(slidingDotsURL), [slidingDotsURL]);

  const context = useMemo<ContextType>(
    () =>
      Object.freeze({
        urlStateMap: new Map<AssetName, readonly [URL]>([['sliding dots', Object.freeze([new URL(slidingDotsURL)])]])
      }),
    [slidingDotsURL]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
});

AssetComposer.displayName = 'AssetComposer';

export default AssetComposer;
