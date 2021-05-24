import ReactWebChat, { createStyleSet, StyleOptions } from '../../../packages/bundle/lib/index-minimal';

function main() {
  const styleOptions: StyleOptions = { accent: 'black' };

  createStyleSet(styleOptions);

  // Verify: Setting "accent" must pass.
  return <ReactWebChat dir="ltr" styleOptions={styleOptions} />;
}
