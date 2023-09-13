import { type ComponentMiddleware } from 'react-chain-of-responsibility';

import { type InputModalityRequest } from './InputModalityRequest';

export type InputModalityMiddleware = ComponentMiddleware<InputModalityRequest>;
