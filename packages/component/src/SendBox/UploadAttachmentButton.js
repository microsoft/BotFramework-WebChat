import React from 'react';

export default class UploadAttachmentButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <input type="file" />
    );
  }
}
