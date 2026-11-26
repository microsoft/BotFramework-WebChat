/// <reference types="jest" />

import injectCSSRolldownPlugin from './injectCSSRolldownPlugin';

test.each(['a\\b', 'a"b', "a'b", 'a`b', 'a$b', 'a b'])(
  'a placeholder with a character that a string literal may escape (%p) throws',
  stylesPlaceholder => {
    expect(() => injectCSSRolldownPlugin({ stylesPlaceholder })).toThrow(
      'inject-css-plugin: the placeholder for styles may contain only letters, digits, "_", "@", "." and "-"'
    );
  }
);

test.each(['@--COMPONENT-STYLES-CONTENT--@', '@--DECORATOR-STYLES-CONTENT--@', '@--FLUENT-STYLES-CONTENT--@'])(
  'the placeholder %p is accepted',
  stylesPlaceholder => {
    expect(() => injectCSSRolldownPlugin({ stylesPlaceholder })).not.toThrow();
  }
);
