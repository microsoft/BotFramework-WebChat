// Emulates "react-dom" of React 19, where `ReactDOM.render()` was removed, on top of React 18.
// Named exports are kept: react-film, bundled in the static build, imports `render` by name (spyip/react-film#110).
import ReactDOM from '/__dist__/packages/bundle/static/react-dom.js';

export * from '/__dist__/packages/bundle/static/react-dom.js';

const { render: _render, ...ReactDOMWithoutRender } = ReactDOM;

export default Object.freeze(ReactDOMWithoutRender);
