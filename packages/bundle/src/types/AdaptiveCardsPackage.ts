import { AdaptiveCard, HorizontalAlignment, TextSize, TextWeight, SerializationContext, Version } from 'adaptivecards';

type AdaptiveCardsPackage = {
  AdaptiveCard: typeof AdaptiveCard;
  HorizontalAlignment: typeof HorizontalAlignment;
  TextSize: typeof TextSize;
  TextWeight: typeof TextWeight;
  SerializationContext: typeof SerializationContext;
  Version: typeof Version;
};

export default AdaptiveCardsPackage;
