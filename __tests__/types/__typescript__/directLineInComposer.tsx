import Composer from '../../../packages/component/lib/Composer';
import createDirectLine from '../../../packages/bundle/lib/createDirectLine';

function main() {
  const directLine = createDirectLine({ token: 'faketoken'});

  return <Composer directLine={directLine} />;
}
