import { Components, createDirectLine } from '../../../packages/component';

const { Composer } = Components;

function main() {
  const directLine = createDirectLine({ token: 'faketoken' });

  return <Composer directLine={directLine} />;
}
