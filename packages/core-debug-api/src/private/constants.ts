declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

const SHOULD_LOCKDOWN = process.env.NODE_ENV === 'production';

export { SHOULD_LOCKDOWN };
