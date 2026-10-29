import { createRoot } from 'react-dom/client';

import createApp from './app.js';

// React 18 and later.
createRoot(document.getElementById('webchat')).render(createApp());
