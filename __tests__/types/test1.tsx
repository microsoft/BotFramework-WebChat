import ReactWebChat, { createStyleSet, StyleOptions } from '../../packages/bundle/lib/index';

function main() {
  const styleOptions: StyleOptions = { accent: 'black', cardEmphasisBackgroundColorXXX: 'orange' };

  createStyleSet(styleOptions);

  // Verify: "dir" must be a string, otherwise, it must fail.
  return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
  // return <ReactWebChat dir={123} styleOptions={styleOptions} />;
}
