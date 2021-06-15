import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine } from '../../../../packages/bundle';

const directLine = createDirectLine({ token: '...' });

ReactDOM.render(<ReactWebChat directLine={directLine} />, document.getElementById('app'));
