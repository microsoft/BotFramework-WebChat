import { McpUiStyleVariableKey } from '@modelcontextprotocol/ext-apps';

function getStyleProperty(el: HTMLElement, property: string): string {
  const value = getComputedStyle(el).getPropertyValue(property);
  return value.trim();
}
/* Crete app theme from FluentUI variables */
export function createAppTheme(el: HTMLElement): Record<McpUiStyleVariableKey, string> {
  return {
    // Background colors
    '--color-background-primary': getStyleProperty(el, '--webchat-colorNeutralBackground1'),
    '--color-background-secondary': getStyleProperty(el, '--webchat-colorNeutralBackground2'),
    '--color-background-tertiary': getStyleProperty(el, '--webchat-colorNeutralBackground3'),
    '--color-background-inverse': getStyleProperty(el, '--webchat-colorNeutralBackgroundInverted'),
    '--color-background-ghost': getStyleProperty(el, '--webchat-colorSubtleBackground'),
    '--color-background-info': getStyleProperty(el, '--webchat-colorBrandBackground2'),
    '--color-background-danger': getStyleProperty(el, '--webchat-colorStatusDangerBackground1'),
    '--color-background-success': getStyleProperty(el, '--webchat-colorStatusSuccessBackground1'),
    '--color-background-warning': getStyleProperty(el, '--webchat-colorStatusWarningBackground1'),
    '--color-background-disabled': getStyleProperty(el, '--webchat-colorNeutralBackgroundDisabled'),

    // Text colors
    '--color-text-primary': getStyleProperty(el, '--webchat-colorNeutralForeground1'),
    '--color-text-secondary': getStyleProperty(el, '--webchat-colorNeutralForeground2'),
    '--color-text-tertiary': getStyleProperty(el, '--webchat-colorNeutralForeground3'),
    '--color-text-inverse': getStyleProperty(el, '--webchat-colorNeutralForegroundInverted'),
    '--color-text-info': getStyleProperty(el, '--webchat-colorBrandForeground1'),
    '--color-text-danger': getStyleProperty(el, '--webchat-colorStatusDangerForeground1'),
    '--color-text-success': getStyleProperty(el, '--webchat-colorStatusSuccessForeground1'),
    '--color-text-warning': getStyleProperty(el, '--webchat-colorStatusWarningForeground1'),
    '--color-text-disabled': getStyleProperty(el, '--webchat-colorNeutralForegroundDisabled'),
    '--color-text-ghost': getStyleProperty(el, '--webchat-colorNeutralForeground4'),

    // Border colors
    '--color-border-primary': getStyleProperty(el, '--webchat-colorNeutralStroke1'),
    '--color-border-secondary': getStyleProperty(el, '--webchat-colorNeutralStroke2'),
    '--color-border-tertiary': getStyleProperty(el, '--webchat-colorNeutralStroke3'),
    '--color-border-inverse': getStyleProperty(el, '--webchat-colorNeutralStrokeOnBrand'),
    '--color-border-ghost': getStyleProperty(el, '--webchat-colorNeutralStrokeSubtle'),
    '--color-border-info': getStyleProperty(el, '--webchat-colorBrandStroke1'),
    '--color-border-danger': getStyleProperty(el, '--webchat-colorStatusDangerBorder1'),
    '--color-border-success': getStyleProperty(el, '--webchat-colorStatusSuccessBorder1'),
    '--color-border-warning': getStyleProperty(el, '--webchat-colorStatusWarningBorder1'),
    '--color-border-disabled': getStyleProperty(el, '--webchat-colorNeutralStrokeDisabled'),

    // Ring colors (focus / emphasis)
    '--color-ring-primary': getStyleProperty(el, '--webchat-colorStrokeFocus2'),
    '--color-ring-secondary': getStyleProperty(el, '--webchat-colorNeutralStrokeAccessible'),
    '--color-ring-inverse': getStyleProperty(el, '--webchat-colorStrokeFocus1'),
    '--color-ring-info': getStyleProperty(el, '--webchat-colorBrandStroke1'),
    '--color-ring-danger': getStyleProperty(el, '--webchat-colorStatusDangerBorderActive'),
    '--color-ring-success': getStyleProperty(el, '--webchat-colorStatusSuccessBorderActive'),
    '--color-ring-warning': getStyleProperty(el, '--webchat-colorStatusWarningBorderActive'),

    // Typography - Family
    '--font-sans': getStyleProperty(el, '--webchat-fontFamilyBase'),
    '--font-mono': getStyleProperty(el, '--webchat-fontFamilyMonospace'),

    // Typography - Weight
    '--font-weight-normal': getStyleProperty(el, '--webchat-fontWeightRegular'),
    '--font-weight-medium': getStyleProperty(el, '--webchat-fontWeightMedium'),
    '--font-weight-semibold': getStyleProperty(el, '--webchat-fontWeightSemibold'),
    '--font-weight-bold': getStyleProperty(el, '--webchat-fontWeightBold'),

    // Typography - Text Size
    '--font-text-xs-size': getStyleProperty(el, '--webchat-fontSizeBase100'),
    '--font-text-sm-size': getStyleProperty(el, '--webchat-fontSizeBase200'),
    '--font-text-md-size': getStyleProperty(el, '--webchat-fontSizeBase300'),
    '--font-text-lg-size': getStyleProperty(el, '--webchat-fontSizeBase400'),

    // Typography - Heading Size
    '--font-heading-xs-size': getStyleProperty(el, '--webchat-fontSizeBase500'),
    '--font-heading-sm-size': getStyleProperty(el, '--webchat-fontSizeBase600'),
    '--font-heading-md-size': getStyleProperty(el, '--webchat-fontSizeHero700'),
    '--font-heading-lg-size': getStyleProperty(el, '--webchat-fontSizeHero800'),
    '--font-heading-xl-size': getStyleProperty(el, '--webchat-fontSizeHero900'),
    '--font-heading-2xl-size': getStyleProperty(el, '--webchat-fontSizeHero1000'),
    // No larger token provided; keep it stable by reusing 1000
    '--font-heading-3xl-size': getStyleProperty(el, '--webchat-fontSizeHero1000'),

    // Typography - Text Line Height
    '--font-text-xs-line-height': getStyleProperty(el, '--webchat-lineHeightBase100'),
    '--font-text-sm-line-height': getStyleProperty(el, '--webchat-lineHeightBase200'),
    '--font-text-md-line-height': getStyleProperty(el, '--webchat-lineHeightBase300'),
    '--font-text-lg-line-height': getStyleProperty(el, '--webchat-lineHeightBase400'),

    // Typography - Heading Line Height
    '--font-heading-xs-line-height': getStyleProperty(el, '--webchat-lineHeightBase500'),
    '--font-heading-sm-line-height': getStyleProperty(el, '--webchat-lineHeightBase600'),
    '--font-heading-md-line-height': getStyleProperty(el, '--webchat-lineHeightHero700'),
    '--font-heading-lg-line-height': getStyleProperty(el, '--webchat-lineHeightHero800'),
    '--font-heading-xl-line-height': getStyleProperty(el, '--webchat-lineHeightHero900'),
    '--font-heading-2xl-line-height': getStyleProperty(el, '--webchat-lineHeightHero1000'),
    // No larger token provided; keep it stable by reusing 1000
    '--font-heading-3xl-line-height': getStyleProperty(el, '--webchat-lineHeightHero1000'),

    // Border radius
    '--border-radius-xs': getStyleProperty(el, '--webchat-borderRadiusSmall'),
    '--border-radius-sm': getStyleProperty(el, '--webchat-borderRadiusMedium'),
    '--border-radius-md': getStyleProperty(el, '--webchat-borderRadiusLarge'),
    '--border-radius-lg': getStyleProperty(el, '--webchat-borderRadiusXLarge'),
    '--border-radius-xl': getStyleProperty(el, '--webchat-borderRadius2XLarge'),
    '--border-radius-full': getStyleProperty(el, '--webchat-borderRadiusCircular'),

    // Border width
    '--border-width-regular': getStyleProperty(el, '--webchat-strokeWidthThin'),

    // Shadows
    // Fluent tokens here are discrete "shadow2/4/8/16/..." — map to a 4-step scale.
    '--shadow-hairline': getStyleProperty(el, '--webchat-shadow2'),
    '--shadow-sm': getStyleProperty(el, '--webchat-shadow4'),
    '--shadow-md': getStyleProperty(el, '--webchat-shadow8'),
    '--shadow-lg': getStyleProperty(el, '--webchat-shadow16')
  };
}
