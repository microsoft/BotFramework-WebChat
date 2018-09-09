export default [
  'Type your message'
].reduce((result, text) => ({
  ...result,
  [text]: text
}), {});
