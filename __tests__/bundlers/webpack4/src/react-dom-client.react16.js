// React 16 has no "react-dom/client": the bundler config points it here when React 16 is installed.

import { render } from 'react-dom';

export function createRoot(container) {
  return Object.freeze({ render: children => render(children, container) });
}
