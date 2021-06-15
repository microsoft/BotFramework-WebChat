import { StrictStyleOptions } from '../StyleOptions';
import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

/**
 * @type {object}
 * @property {boolean} atEnd - `true`, if the transcript scroll view is at the end, otherwise, `false`.
 * @property {object} styleOptions - Normalized style options.
 * @property {boolean} unread - `true`, if there are unread messages in the transcripts, otherwise, `false`.
 */
type ScrollToEndButtonComponentArguments = [
  {
    atEnd: boolean;
    styleOptions: StrictStyleOptions;
    unread: boolean;
  }
];

/**
 * @type {object}
 * @property {function} onClick - The callback function to call when the user click on the button.
 */
type ScrollToEndButtonProps = {
  onClick: () => any;
};

/**
 * The middleware for rendering scroll to end button.
 */
type ScrollToEndButtonMiddleware = ComponentMiddleware<[], ScrollToEndButtonComponentArguments, ScrollToEndButtonProps>;
type ScrollToEndButtonComponentFactory = ComponentFactory<ScrollToEndButtonComponentArguments, ScrollToEndButtonProps>;

export default ScrollToEndButtonMiddleware;

export { ScrollToEndButtonComponentFactory };
