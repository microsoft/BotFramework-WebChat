import type { ReactElement } from 'react';

type StaticElement = Exclude<ReactElement | string, undefined>;

type StaticElementEntry = {
  element: StaticElement;
  key: number;
};

export type { StaticElement, StaticElementEntry };
