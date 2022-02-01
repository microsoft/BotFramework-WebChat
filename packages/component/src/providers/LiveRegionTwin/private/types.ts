import type { ReactElement } from 'react';

type LiveRegionElement = Exclude<ReactElement | string, undefined>;

export type { LiveRegionElement };
