import { ReactNode } from 'react';

type TypingIndicatorProps = {
  visible: boolean;
};

export type RenderTypingIndicator = (props: TypingIndicatorProps) => ReactNode;

type TypingIndicatorEnhancer = (next: RenderTypingIndicator) => RenderTypingIndicator;
type TypingIndicatorMiddleware = () => TypingIndicatorEnhancer;

export default TypingIndicatorMiddleware;
