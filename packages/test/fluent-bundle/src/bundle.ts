import React from 'react';
import ReactDOMClient from 'react-dom/client';
import * as Fluent from '@fluentui/react-components';

Object.assign(globalThis as any, {
  React, ReactDOMClient, Fluent
});
