import { hooks } from 'botframework-webchat-component';
import { useMemo } from 'react';

import createDefaultAdaptiveCardHostConfig from '../Styles/adaptiveCardHostConfig';
import useAdaptiveCardsContext from './internal/useAdaptiveCardsContext';

const { useStyleOptions } = hooks;

export default function useAdaptiveCardsHostConfig() {
  const { hostConfigFromProps } = useAdaptiveCardsContext();
  const [styleOptions] = useStyleOptions();

  const patchedHostConfig = useMemo(() => hostConfigFromProps || createDefaultAdaptiveCardHostConfig(styleOptions), [
    hostConfigFromProps,
    styleOptions
  ]);

  return [patchedHostConfig];
}
