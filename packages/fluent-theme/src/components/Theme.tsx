import React, { type ReactNode } from 'react';
import { useStyles } from '../styles';

const styles = {
  'webchat-fluent__theme': {
    display: 'contents',

    '--webchat-colorNeutralForeground1': 'var(--colorNeutralForeground1, #242424)',
    '--webchat-colorNeutralForeground2': 'var(--colorNeutralForeground2, #424242)',
    '--webchat-colorNeutralForeground4': 'var(--colorNeutralForeground4, #707070)',

    '--webchat-colorNeutralForegroundDisabled': 'var(--colorNeutralForegroundDisabled, #bdbdbd)',

    '--webchat-colorNeutralBackground1': 'var(--colorNeutralBackground1, #ffffff)',
    '--webchat-colorNeutralBackground4': 'var(--colorNeutralBackground4, #f0f0f0)',
    '--webchat-colorNeutralBackground5': 'var(--colorNeutralBackground5, #ebebeb)',

    '--webchat-colorSubtleBackgroundHover': 'var(--colorSubtleBackgroundHover, #f5f5f5)',
    '--webchat-colorSubtleBackgroundPressed': 'var(--colorSubtleBackgroundPressed, #e0e0e0)',

    '--webchat-colorNeutralStroke1': 'var(--colorNeutralStroke1, #d1d1d1)',
    '--webchat-colorNeutralStroke2': 'var(--colorNeutralStroke2, #e0e0e0)',
    '--webchat-colorNeutralStroke1Selected': 'var(--colorNeutralStroke1Selected, #bdbdbd)',

    '--webchat-colorBrandStroke2': 'var(--colorBrandStroke2, #9edcf7)',

    '--webchat-colorBrandForeground2Hover': 'var(--colorBrandForeground2Hover, #015a7a)',
    '--webchat-colorBrandForeground2Pressed': 'var(--colorBrandForeground2Pressed, #01384d)',

    '--webchat-colorBrandBackground2Hover': 'var(--colorBrandBackground2Hover, #bee7fa)',
    '--webchat-colorBrandBackground2Pressed': 'var(--colorBrandBackground2Pressed, #7fd2f5)',

    '--webchat-colorCompoundBrandForeground1': 'var(--colorCompoundBrandForeground1, #077fab)',

    '--webchat-colorCompoundBrandForeground1Hover': 'var(--colorCompoundBrandForeground1Hover, #02729c)',
    '--webchat-colorCompoundBrandForeground1Pressed': 'var(--colorCompoundBrandForeground1Pressed, #01678c)',

    '--webchat-colorStatusDangerForeground1': 'var(--colorStatusDangerForeground1, #b10e1c)',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/colors.ts
    '--webchat-colorGray30': 'var(--colorGray30, #edebe9)',
    '--webchat-colorGray160': 'var(--colorGray160, #323130)',
    '--webchat-colorGray200': 'var(--colorGray200, #1b1a19)',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts
    '--webchat-borderRadiusSmall': 'var(--borderRadiusSmall, 2px)',
    '--webchat-borderRadiusLarge': 'var(--borderRadiusLarge, 6px)',
    '--webchat-borderRadiusXLarge': 'var(--borderRadiusXLarge, 8px)',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/utils/shadows.ts
    '--webchat-shadow16':
      'var(--shadow16, 0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108))',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts
    '--webchat-spacingHorizontalMNudge': 'var(--spacingHorizontalMNudge, 10px)',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts
    '--webchat-fontFamilyBase': `var(--fontFamilyBase, 'Segoe UI)', 'Segoe UI Web (West European))', -apple-system,
      BlinkMacSystemFont, Roboto, 'Helvetica Neue)', sans-serif)`,
    '--webchat-fontFamilyNumeric': `var(--fontFamilyNumeric, Bahnschrift, 'Segoe UI)', 'Segoe UI Web (West European))',
      -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue)', sans-serif)`,

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts
    '--webchat-fontWeightSemibold': 'var(--fontWeightSemibold, 600)'
  }
};

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={classNames['webchat-fluent__theme']}>{props.children}</div>;
}
