import { useFileDropZone, useLocalizer } from 'botframework-webchat/hook.js';
import cx from 'classnames';
import React, { memo } from 'react';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import styles from './DropZone.module.css';

const DropZone = (props: { readonly onFilesAdded: (files: readonly File[]) => void }) => {
  const { dropZoneRef, dropZoneState, handleDragOver, handleDrop } = useFileDropZone(props.onFilesAdded);
  const classNames = useStyles(styles);
  const localize = useLocalizer();

  return dropZoneState ? (
    <div
      className={cx(classNames['sendbox__attachment-drop-zone'], {
        [classNames['sendbox__attachment-drop-zone--droppable']]: dropZoneState === 'droppable'
      })}
      data-testid={testIds.sendBoxDropZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={dropZoneRef}
    >
      <FluentIcon appearance="text" className={classNames['sendbox__attachment-drop-zone-icon']} icon="add-document" />
      {localize('TEXT_INPUT_DROP_ZONE')}
    </div>
  ) : null;
};

DropZone.displayName = 'DropZone';

export default memo(DropZone);
