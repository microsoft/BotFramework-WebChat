export type WorkerJob = {
  arrayBuffer: ArrayBuffer;
  maxHeight: number;
  maxWidth: number;
  quality: number;
  type: string;
};

export type WorkerReturnValue =
  | {
      result: string;
    }
  | {
      error: {
        message: string;
        stack: string;
      };
    };
