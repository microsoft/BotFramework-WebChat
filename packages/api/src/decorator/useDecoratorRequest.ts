import { useContext } from 'react';
import { ActivityBorderDecoratorRequest } from './ActivityBorder/ActivityBorderDecorator';

export default function useDecoratorRequest(type: typeof ActivityBorderDecoratorRequest) {
  const request = useContext(type)?.request;

  if (!request) {
    throw new Error(`useDecoratorRequest must be used within a ${type}Provider`);
  }

  return request;
}

export type InferDecoratorRequest<T extends typeof ActivityBorderDecoratorRequest> =
  T extends React.Context<infer U> ? (U extends { request: infer R } ? R : never) : never;
