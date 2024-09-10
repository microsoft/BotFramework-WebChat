import React, { memo } from 'react';

function Attachment({
  content,
  contentUrl,
  contentType,
  name
}: Readonly<{
  content?: string | undefined;
  contentUrl?: string | undefined;
  contentType?: string | undefined;
  name?: string | undefined;
}>) {
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
      }

      // eslint-disable-next-line no-magic-numbers
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
}

export default memo(Attachment);
