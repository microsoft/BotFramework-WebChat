import React, { forwardRef, memo, type RefObject } from 'react';

function NothingSelected_() {
  return (
    <React.Fragment>
      <h4>Nothing selected</h4>
      <p>Click on any message sent from the user or the bot to inspect it.</p>
    </React.Fragment>
  );
}

const NothingSelected = memo(NothingSelected_);

const Inspector = forwardRef<HTMLDivElement, Readonly<{ inspectedObject: any | undefined }>>(
  ({ inspectedObject }, ref) => {
    return (
      <div className="inspector" tabIndex={-1} ref={ref}>
        <h2>Inspector</h2>
        <div>{inspectedObject ? <pre>{JSON.stringify(inspectedObject, null, 4)}</pre> : <NothingSelected />}</div>
      </div>
    );
  }
);

export default memo(Inspector);
