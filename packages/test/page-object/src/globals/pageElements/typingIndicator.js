import { testIds } from 'botframework-webchat';

import root from './root';

export default function typingIndicator() {
  return root().querySelector(`[data-testid="${testIds.typingIndicator}"]`);
}
