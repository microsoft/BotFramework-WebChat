import ReactWebChat from '../../../packages/bundle/lib/index';
import createDirectLine from '../../../packages/bundle/lib/createDirectLine';

function main() {
  const directLine = createDirectLine({ token: 'faketoken'});

  return <ReactWebChat directLine={directLine} />;
}
