import React, { type ReactNode } from 'react';
import { useStyles } from '../styles';

const styles = {
  'webchat-fluent__theme': {
    display: 'contents',

    '--colorNeutralForeground1': '#242424',
    '--colorNeutralForeground2': '#424242',
    '--colorNeutralForeground4': '#707070',

    '--colorNeutralForegroundDisabled': '#bdbdbd',

    '--colorNeutralBackground1': '#ffffff',
    '--colorNeutralBackground4': '#f0f0f0',
    '--colorNeutralBackground5': '#ebebeb',

    '--colorSubtleBackgroundHover': '#f5f5f5',
    '--colorSubtleBackgroundPressed': '#e0e0e0',

    '--colorNeutralStroke1': '#d1d1d1',
    '--colorNeutralStroke2': '#e0e0e0',
    '--colorNeutralStroke1Selected': '#bdbdbd',

    '--colorBrandStroke2': '#9edcf7',

    '--colorBrandForeground2Hover': '#015a7a',
    '--colorBrandForeground2Pressed': '#01384d',

    '--colorBrandBackground2Hover': '#bee7fa',
    '--colorBrandBackground2Pressed': '#7fd2f5',

    '--colorCompoundBrandForeground1': '#077fab',

    '--colorCompoundBrandForeground1Hover': '#02729c',
    '--colorCompoundBrandForeground1Pressed': '#01678c',

    '--colorStatusDangerForeground1': '#b10e1c',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/colors.ts
    '--colorGray30': '#edebe9',
    '--colorGray160': '#323130',
    '--colorGray200': '#1b1a19',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts
    '--borderRadiusSmall': '2px',
    '--borderRadiusLarge': '6px',
    '--borderRadiusXLarge': '8px',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/utils/shadows.ts
    '--shadow16': '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts
    '--spacingHorizontalMNudge': '10px',

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts
    '--fontFamilyBase': `'Segoe UI', 'Segoe UI Web (West European)', -apple-system,
      BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif`,
    '--fontFamilyNumeric': `Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)',
      -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif`,

    // https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/fonts.ts
    '--fontWeightSemibold': 600
  }
};

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={classNames['webchat-fluent__theme']}>{props.children}</div>;
}
