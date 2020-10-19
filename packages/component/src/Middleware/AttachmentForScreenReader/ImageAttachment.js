import React from 'react';

import useLocalizer from '../../hooks/useLocalizer';

const ImageAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_IMAGE');

  return <div>{label}</div>;
};

export default ImageAttachment;
