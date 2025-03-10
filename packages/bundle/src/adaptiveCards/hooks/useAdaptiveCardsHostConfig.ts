import { useMemo } from 'react';

import createDefaultAdaptiveCardHostConfig from '../Styles/adaptiveCardHostConfig';
import useAdaptiveCardsContext from './internal/useAdaptiveCardsContext';
import useStyleOptions from '../../hooks/useStyleOptions';

export default function useAdaptiveCardsHostConfig(): [any] {
  const { hostConfigFromProps } = useAdaptiveCardsContext();
  const [styleOptions] = useStyleOptions();

  const patchedHostConfig = useMemo(
    () => hostConfigFromProps || createDefaultAdaptiveCardHostConfig(styleOptions),
    [hostConfigFromProps, styleOptions]
  );

  return [patchedHostConfig];
}
