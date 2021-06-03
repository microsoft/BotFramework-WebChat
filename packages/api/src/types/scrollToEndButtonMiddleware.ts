import { RendererCreator, RendererMiddleware } from './rendererMiddleware';
import { StrictStyleOptions } from '../StyleOptions';

export type ScrollToEndButtonCreateOptions = {
  /** True, if the transcript scroll view is at the end, otherwise, false. */
  atEnd: boolean;
  styleOptions: StrictStyleOptions;

  /** True, if there are unread messages in the transcripts, otherwise, false. */
  unread: boolean;
};

export type ScrollToEndButtonProps = {
  onClick: () => any;
};

export type ScrollToEndButtonMiddleware = RendererMiddleware<
  {},
  ScrollToEndButtonCreateOptions,
  ScrollToEndButtonProps
>;

export type ScrollToEndButtonCreator = RendererCreator<ScrollToEndButtonCreateOptions, ScrollToEndButtonProps>;
