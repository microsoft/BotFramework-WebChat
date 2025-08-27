import { Components } from 'botframework-webchat-component';
import { type ComponentType } from 'react';

type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

const { ErrorBox } = Components;

type ErrorBoxProps = PropsOf<typeof ErrorBox>;

// TODO: [P4] We should move the <ErrorBox> into this package on or after 2027-08-16.
export default ErrorBox;
export { type ErrorBoxProps };
