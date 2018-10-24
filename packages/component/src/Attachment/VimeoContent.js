import React from 'react';

import Context from '../Context';

export default ({ alt, autoPlay, embedID, loop }) => {
  const search = new URLSearchParams({
    autoplay: autoPlay ? 1 : 0,
    badge: 0,
    byline: 0,
    loop: loop ? 1 : 0,
    portrait: 0,
    title: 0
  }).toString();

  return (
    <Context.Consumer>
      { ({ styleSet }) =>
        <iframe
          aria-label={ alt }
          className={ styleSet.vimeoContent }
          src={ `https://player.vimeo.com/video/${ embedID }?${ search }` }
        />
      }
    </Context.Consumer>
  );
}
