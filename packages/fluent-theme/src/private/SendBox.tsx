import React, { memo } from 'react';

type Props = Readonly<{ className?: string | undefined }>;

const SendBox = ({ className }: Props) => <div className={className}>{'Fluent send box'}</div>;

export default memo(SendBox);
