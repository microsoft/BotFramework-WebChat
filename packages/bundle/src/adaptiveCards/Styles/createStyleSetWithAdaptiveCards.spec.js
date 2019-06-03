import createStyleSet from './createStyleSetWithAdaptiveCards';

describe('createStyleSetWithAdaptiveCards', () => {
  it('should contain Adaptive Card styles in createStyleSet', () => {
    const { adaptiveCardRenderer, animationCardAttachment, audioCardAttachment } = createStyleSet();

    expect(adaptiveCardRenderer).not.toBeFalsy();
    expect(animationCardAttachment).not.toBeFalsy();
    expect(audioCardAttachment).not.toBeFalsy();
  });
});
