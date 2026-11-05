import '../setup';

import React, { type ReactElement } from 'react';
import { expectAssignable } from 'tsd';

import { Components, createStore } from '../../src/boot/exports/index';

const { BasicWebChat, Composer } = Components;

const store = createStore({});

expectAssignable<ReactElement>(
  <Composer directLine={undefined} store={store}>
    <BasicWebChat />
  </Composer>
);
