import ReactWebChat, { createStyleSet, StyleOptions } from '../../../packages/bundle/lib/index-minimal';

function main() {
  const styleOptions: StyleOptions = { cardEmphasisBackgroundColor: 'orange' };

  createStyleSet(styleOptions);

  // Verify: Setting "cardEmphasisBackgroundColor" using minimal bundle must fail.
  return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
}
