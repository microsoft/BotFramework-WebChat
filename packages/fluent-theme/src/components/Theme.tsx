import React, { type ReactNode } from 'react';
import { useStyles } from '../styles';

const styles = {
  webchat__theme: {
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

    '--colorCompoundBrandForeground2': '#02729c',
    '--colorNeutralForeground2BrandHover': '#02729c',
    '--colorNeutralForeground2BrandPressed': '#01678c',
    '--colorStatusDangerForeground1': '#b10e1c',

    '--borderRadiusSmall': '2px',
    '--borderRadiusLarge': '6px',

    '--fontFamilyBase': `'Segoe UI', 'Segoe UI Web (West European)', -apple-system,
      BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif`,
    '--fontFamilyNumeric': `Bahnschrift, 'Segoe UI', 'Segoe UI Web (West European)',
      -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif`
  }
};

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={classNames.webchat__theme} {...props} />;
}
