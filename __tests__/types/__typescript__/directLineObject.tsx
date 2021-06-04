import ReactWebChat, { createDirectLine } from '../../../packages/bundle';

function main() {
  const directLine = createDirectLine({ token: 'faketoken' });

  return <ReactWebChat directLine={directLine} />;
}
