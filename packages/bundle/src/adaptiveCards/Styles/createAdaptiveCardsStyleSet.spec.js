import createStyleSet from './createAdaptiveCardsStyleSet';

describe('createAdaptiveCardsStyleSet', () => {
  it('should contain Adaptive Card styles in createStyleSet', () => {
    const { adaptiveCardRenderer, animationCardAttachment, audioCardAttachment } = createStyleSet();

    expect(adaptiveCardRenderer).not.toBeFalsy();
    expect(animationCardAttachment).not.toBeFalsy();
    expect(audioCardAttachment).not.toBeFalsy();
  });
});
