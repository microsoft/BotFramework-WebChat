import { RendererMiddleware } from './types/RendererMiddleware';
import { ScrollToEndButtonMiddleware } from './types/ScrollToEndButtonMiddleware';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';

declare const defaultStyleOptions: Required<StyleOptions>;

// TODO: [P2] ESLint of DLSpeech SDK should ignore this file since its from API.
// eslint-disable-next-line no-unused-vars
declare function normalizeStyleOptions(styleOptions: StyleOptions): StrictStyleOptions;

export type { RendererMiddleware, ScrollToEndButtonMiddleware, StrictStyleOptions, StyleOptions };
export { defaultStyleOptions, normalizeStyleOptions };
