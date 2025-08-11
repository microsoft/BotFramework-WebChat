/* eslint-disable prefer-arrow-callback */
import React, { Fragment, memo, type ComponentType, type ReactNode } from 'react';

type PipelineProps<R, P> = Readonly<{ request: R }> & P;
type InnerPipelineProps<R, P> = PipelineProps<R, P> & Readonly<{ originalRequest: R }>;

type NextComponent<P, R> = ComponentType<P & Readonly<{ request?: R | undefined }>>;
type ComposedComponent<P, R> = ComponentType<InnerPipelineProps<R, P>>;
type StageComponent<R, P> = ComponentType<
  PipelineProps<R, P> & {
    Next: NextComponent<P, R>;
  }
>;
type PipelineComponent<P, R> = ComponentType<PipelineProps<R, P>>;

const Passthrough = memo(function PipelinePassthrough({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  return <Fragment>{children}</Fragment>;
});

export function composePipeline<
  Request,
  Props extends { children?: ReactNode | undefined } = { children?: ReactNode | undefined }
>(stages: StageComponent<Request, Props>[], PassthroughComponent = Passthrough): PipelineComponent<Props, Request> {
  const ComposedPipeline = stages.reduceRight<ComposedComponent<Props, Request>>((Next, Stage) => {
    const StageMemo = memo(Stage);

    const StageWrapper = memo<InnerPipelineProps<Request, Props>>(({ originalRequest, request, ...innerRest }) => {
      const resolvedRequest = request ?? originalRequest;
      return (
        <StageMemo
          Next={Next as NextComponent<Props, Request>}
          request={resolvedRequest}
          {...(innerRest as Props)}
          originalRequest={originalRequest}
        />
      );
    });
    StageWrapper.displayName = `PipelineStage(Memo(${Stage.displayName || Stage.name}))`;
    return StageWrapper;
  }, PassthroughComponent);

  return memo(function Pipeline(props: PipelineProps<Request, Props>) {
    const { request, ...restProps } = props;

    return <ComposedPipeline request={request} {...(restProps as unknown as Props)} originalRequest={request} />;
  });
}

export type { NextComponent, PipelineProps, PipelineComponent, StageComponent };
