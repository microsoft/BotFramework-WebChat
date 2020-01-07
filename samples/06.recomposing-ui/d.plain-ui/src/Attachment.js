import React from 'react';

const Attachment = ({ content, contentUrl, contentType, name }) => {
  switch (contentType) {
    case 'image/gif':
    case 'image/jpeg':
    case 'image/png':
    case 'image/svg':
    case 'image/svg+xml':
      return <img alt={name} src={contentUrl} />;

    case 'text/markdown':
    case 'text/plain':
      return <p>{content}</p>;

    default:
      if (contentUrl) {
        return (
          <a href={contentUrl} rel="noopener noreferrer" target="_blank">
            {name}
          </a>
        );
      } else {
        return <pre>{JSON.stringify(content, null, 2)}</pre>;
      }
  }
};

export default Attachment;
