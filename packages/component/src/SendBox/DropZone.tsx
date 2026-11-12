import { hooks } from 'botframework-webchat-api';
import { useFileDropZone } from '@msinternal/botframework-webchat-react-hooks';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';

import testIds from '../testIds';
import styles from './SendBox.module.css';

const { useLocalizer } = hooks;

type DropZoneProps = Readonly<{
  onFilesAdded: (files: File[]) => void;
}>;

function DropZone({ onFilesAdded }: DropZoneProps) {
  const { dropZoneRef, dropZoneState, handleDragOver, handleDrop } = useFileDropZone(onFilesAdded);
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const localize = useLocalizer();

  return dropZoneState ? (
    <div
      className={cx(classNames['drop-zone'], {
        [classNames['drop-zone--droppable']]: dropZoneState === 'droppable'
      })}
      data-testid={testIds.sendBoxDropZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={dropZoneRef}
    >
      <span className={classNames['drop-zone__text']}>{localize('TEXT_INPUT_DROP_ZONE')}</span>
    </div>
  ) : null;
}

DropZone.displayName = 'DropZone';

export default memo(DropZone);
