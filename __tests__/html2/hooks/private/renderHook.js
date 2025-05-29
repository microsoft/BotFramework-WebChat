// Adopted from https://github.com/testing-library/react-testing-library/blob/main/src/pure.js#L292C1-L329C2

/*!
 * The MIT License (MIT)
 * Copyright (c) 2017-Present Kent C. Dodds
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function wrapUiIfNeeded(innerElement, wrapperComponent) {
  return wrapperComponent ? React.createElement(wrapperComponent, null, innerElement) : innerElement;
}

export default function renderHook(
  /** @type {(props: RenderCallbackProps) => any} */ renderCallback,
  /** @type {{}} */ options = {}
) {
  const { initialProps, ...renderOptions } = options;

  if (renderOptions.legacyRoot && typeof ReactDOM.render !== 'function') {
    const error = new Error(
      '`legacyRoot: true` is not supported in this version of React. ' +
        'If your app runs React 19 or later, you should remove this flag. ' +
        'If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.'
    );
    Error.captureStackTrace(error, renderHook);
    throw error;
  }

  const result = React.createRef();

  function TestComponent({ renderCallbackProps }) {
    const pendingResult = renderCallback(renderCallbackProps);

    React.useEffect(() => {
      result.current = pendingResult;
    });

    return null;
  }

  // A stripped down version of render() from `@testing-library/react`.
  const render = ({ renderCallbackProps }) => {
    const element = document.querySelector('main');

    ReactDOM.render(
      wrapUiIfNeeded(React.createElement(TestComponent, { renderCallbackProps }), renderOptions.wrapper),
      element
    );

    return { rerender: render, unmount: () => ReactDOM.unmountComponentAtNode(element) };
  };

  const { rerender: baseRerender, unmount } = render({ renderCallbackProps: initialProps });

  function rerender(rerenderCallbackProps) {
    return baseRerender({ renderCallbackProps: rerenderCallbackProps });
  }

  return { result, rerender, unmount };
}
