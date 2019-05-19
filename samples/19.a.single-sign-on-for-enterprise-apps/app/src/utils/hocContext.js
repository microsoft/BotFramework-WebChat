import { createElement } from 'react';

export default (context, selector = state => state) => component => props =>
  createElement(
    context.Consumer,
    {},
    state => createElement(
      component,
      {
        ...props,
        ...selector(state)
      }
    )
  )
