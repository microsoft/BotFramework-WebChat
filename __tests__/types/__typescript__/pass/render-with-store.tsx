import ReactDOM from 'react-dom';

import { Components, createStore } from '../../../../packages/bundle';

const { Composer } = Components;

const store = createStore({});

ReactDOM.render(<Composer directLine={undefined} store={store} />, document.getElementById('app'));
