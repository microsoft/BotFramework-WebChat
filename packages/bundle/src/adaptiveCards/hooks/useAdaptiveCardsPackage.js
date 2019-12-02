import useAdaptiveCardsContext from './internal/useAdaptiveCardsContext';

export default function useAdaptiveCardsPackage() {
  const { adaptiveCardsPackage } = useAdaptiveCardsContext();

  return [adaptiveCardsPackage];
}
