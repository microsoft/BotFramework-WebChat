import ReactWebChat, { createStyleSet, StyleOptions } from '../../../packages/bundle';

function main() {
  const styleOptions: StyleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };

  createStyleSet(styleOptions);

  // "dir" of type number should fail
  return <ReactWebChat dir={123} styleOptions={styleOptions} />;
}
