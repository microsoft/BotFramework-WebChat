import { memo } from 'react';
import createDecoratorComposer from './createDecoratorComposer';

export const DecoratorComposer = memo(createDecoratorComposer());

DecoratorComposer.displayName = 'DecoratorComposer';
