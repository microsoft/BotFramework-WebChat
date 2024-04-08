import React, { type DragEventHandler, useCallback, useEffect, useState } from 'react';
import { hooks } from 'botframework-webchat-api';
import { AddDocumentIcon } from '../../icons/AddDocumentIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  'webchat__sendbox__attachment-dropzone': {
    backgroundColor: 'var(--colorNeutralBackground4)',
    borderRadius: 'inherit',
    cursor: 'copy',
    display: 'grid',
    gap: '8px',
    inset: '0',
    placeContent: 'center',
    placeItems: 'center',
    position: 'absolute'
  },

  'webchat__sendbox__attachment-dropzone-icon': {
    height: '36px',
    width: '36px'
  }
};

const handleDragOver: DragEventHandler<HTMLDivElement> = event => {
  event.stopPropagation();
  event.preventDefault();
};

const isFilesTransferEvent = (event: DragEvent) => !!event?.dataTransfer?.types?.includes?.('Files');

export default function AttachmentDropZone(props: { readonly onFilesAdded: (files: File[]) => void }) {
  const classNames = useStyles(styles);
  const [showDropZone, setShowDropZone] = useState<boolean>(false);
  const localize = useLocalizer();

  useEffect(() => {
    const handleDragEnd = () => setShowDropZone(false);
    const handleDragStart = (event: DragEvent) => {
      if (!isFilesTransferEvent(event)) {
        return;
      }
      setShowDropZone(true);
      document.addEventListener('click', handleDragEnd, {
        once: true,
        capture: true
      });
    };

    document.addEventListener('dragenter', handleDragStart, false);
    document.addEventListener('dragend', handleDragEnd, false);
    return () => {
      document.removeEventListener('dragenter', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    event => {
      event.preventDefault();
      setShowDropZone(false);
      if (!isFilesTransferEvent(event.nativeEvent)) {
        return;
      }
      props.onFilesAdded([...event.dataTransfer.files]);
    },
    [setShowDropZone]
  );

  return showDropZone ? (
    <div
      className={classNames['webchat__sendbox__attachment-dropzone']}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AddDocumentIcon className={classNames['webchat__sendbox__attachment-dropzone-icon']} />
      <span>{localize('TEXT_INPUT_DROP_ZONE')}</span>
    </div>
  ) : null;
}
