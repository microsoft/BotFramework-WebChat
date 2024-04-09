import React, { type DragEventHandler, useCallback, useEffect, useState } from 'react';
import { hooks } from 'botframework-webchat-api';
import { AddDocumentIcon } from '../../icons/AddDocumentIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  'webchat-fluent__sendbox__attachment-drop-zone': {
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

  'webchat-fluent__sendbox__attachment-drop-zone-icon': {
    height: '36px',
    width: '36px'
  }
};

const handleDragOver: DragEventHandler<HTMLDivElement> = event => {
  event.stopPropagation();
  event.preventDefault();
};

// TODO: respect style options for the files type and cout
const isFilesTransferEvent = (event: DragEvent) => !!event?.dataTransfer?.types?.includes?.('Files');

export default function DropZone(props: { readonly onFilesAdded: (files: File[]) => void }) {
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
      className={classNames['webchat-fluent__sendbox__attachment-drop-zone']}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AddDocumentIcon className={classNames['webchat-fluent__sendbox__attachment-drop-zone-icon']} />
      {localize('TEXT_INPUT_DROP_ZONE')}
    </div>
  ) : null;
}