import ReactWebChat, { createStyleSet, StyleOptions } from '../../../packages/bundle/lib/index';

function main() {
  const styleOptions: StyleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };

  createStyleSet(styleOptions);

  // Verify: "dir" of type string should pass
  return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
}
