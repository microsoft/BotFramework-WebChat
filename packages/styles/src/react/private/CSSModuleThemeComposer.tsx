import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useContext, useMemo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

import combineCSSModules from './combineCSSModules';
import CSSModuleThemeContext, { cssModuleThemeSchema } from './CSSModuleThemeContext';

const cssModuleThemeComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    // Pass a stable object (e.g. built once at module level with combineCSSModules()) to avoid re-rendering every useStyles().
    theme: cssModuleThemeSchema
  }),
  readonly()
);

type CSSModuleThemeComposerProps = InferReactProps<typeof cssModuleThemeComposerPropsSchema>;

/**
 * Provides class names for CSS module local names to every `useStyles()` below, e.g. a theme styling Web Chat elements.
 *
 * Classes from a composer above are added to ours, never replace them, so an outer composer can add to a theme.
 */
function CSSModuleThemeComposer(props: CSSModuleThemeComposerProps) {
  const { children, theme } = validateProps(cssModuleThemeComposerPropsSchema, props);

  const outerTheme = useContext(CSSModuleThemeContext);

  const context = useMemo(() => combineCSSModules(theme, outerTheme), [outerTheme, theme]);

  return <CSSModuleThemeContext.Provider value={context}>{children}</CSSModuleThemeContext.Provider>;
}

CSSModuleThemeComposer.displayName = 'CSSModuleThemeComposer';

export default memo(CSSModuleThemeComposer);
export { cssModuleThemeComposerPropsSchema, type CSSModuleThemeComposerProps };
