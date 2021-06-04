import AdaptiveCardsPackage from '../../types/AdaptiveCardsPackage';
import useAdaptiveCardsContext from './internal/useAdaptiveCardsContext';

export default function useAdaptiveCardsPackage(): [AdaptiveCardsPackage] {
  const { adaptiveCardsPackage } = useAdaptiveCardsContext();

  return [adaptiveCardsPackage];
}
