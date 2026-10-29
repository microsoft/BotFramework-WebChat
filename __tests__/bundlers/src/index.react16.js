import { render } from 'react-dom';

import createApp from './app.js';

// React 16 has no "react-dom/client".
render(createApp(), document.getElementById('webchat'));
