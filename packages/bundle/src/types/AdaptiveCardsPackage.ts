import {
  AdaptiveCard,
  GlobalSettings,
  HorizontalAlignment,
  HostConfig,
  SerializationContext,
  TextSize,
  TextWeight,
  Version
} from 'adaptivecards';

type AdaptiveCardsPackage = {
  AdaptiveCard: typeof AdaptiveCard;
  GlobalSettings: typeof GlobalSettings;
  HorizontalAlignment: typeof HorizontalAlignment;
  HostConfig: typeof HostConfig;
  TextSize: typeof TextSize;
  TextWeight: typeof TextWeight;
  SerializationContext: typeof SerializationContext;
  Version: typeof Version;
};

export { type AdaptiveCardsPackage };
