import { useMemo } from 'react';

import remarkStripMarkdown from '../../Utils/remarkStripMarkdown';

export default function useStripMarkdown(markdown) {
  return useMemo(() => markdown && remarkStripMarkdown(markdown).replace(/[.\s]+$/u, ''), [markdown]);
}
