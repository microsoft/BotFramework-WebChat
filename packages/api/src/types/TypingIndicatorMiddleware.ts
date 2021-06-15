import { ReactNode } from 'react';

import Typing from './Typing';

type TypingIndicatorProps = {
  activeTyping: { [id: string]: Typing };
  typing: { [id: string]: Typing };
  visible: boolean;
};

type RenderTypingIndicator = (props: TypingIndicatorProps) => ReactNode;

type TypingIndicatorEnhancer = (next: RenderTypingIndicator) => RenderTypingIndicator;
type TypingIndicatorMiddleware = () => TypingIndicatorEnhancer;

export default TypingIndicatorMiddleware;

export type { RenderTypingIndicator };
