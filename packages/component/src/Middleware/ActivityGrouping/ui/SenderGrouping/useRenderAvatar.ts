import { type ReactNode } from 'react';
import useSenderGroupingContext from './private/useSenderGroupingContext';

export default function useRenderAvatar(): false | (() => Exclude<ReactNode, boolean | null | undefined>) {
  return useSenderGroupingContext().renderAvatar;
}
