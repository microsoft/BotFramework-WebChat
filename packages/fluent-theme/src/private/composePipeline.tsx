import React, { Fragment, memo, type ReactNode } from 'react';

type PipelineProps<R, P> = Readonly<{ request: R }> & P;

type OptionalRequest<P, R> = Omit<PipelineProps<R, P>, 'request'> & { request?: R | undefined };

type StageComponent<R, P> = React.ComponentType<
  PipelineProps<R, P> & {
    Next: React.ComponentType<OptionalRequest<PipelineProps<R, P>, R>>;
  }
>;

const PassthroughComp = ({ children }: Readonly<{ children: ReactNode | undefined }>) => (
  <Fragment>{children}</Fragment>
);

export function composePipeline<
  R,
  P extends { children?: ReactNode | undefined } = { children?: ReactNode | undefined }
>(
  origStages: StageComponent<R, P>[],
  Passthrough = PassthroughComp
): React.FC<OptionalRequest<PipelineProps<R, P>, R>> {
  const stages = origStages.map(Stage => memo(Stage)) as StageComponent<R, P>[];
  function Pipeline(props: PipelineProps<R, P>) {
    const { request: originalRequest, ...restProps } = props;

    const Composed = stages.reduceRight<React.ComponentType<PipelineProps<R, P>>>(
      (Next, Stage) =>
        // @ts-expect-error: PropTypes issue
        ({ request = originalRequest, ...innerRest }) => <Stage Next={Next} request={request} {...(innerRest as P)} />,

      // @ts-expect-error: PropTypes issue
      ({ request: _, ...innerRest }) => <Passthrough {...(innerRest as P)} />
    );

    return <Composed request={originalRequest} {...(restProps as unknown as P)} />;
  }

  return memo(Pipeline) as unknown as React.FC<OptionalRequest<PipelineProps<R, P>, R>>;
}
