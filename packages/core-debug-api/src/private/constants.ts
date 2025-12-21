declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

const SHOULD_LOCKDOWN = process.env.NODE_ENV === 'production';
// const SHOULD_LOCKDOWN = true;

export { SHOULD_LOCKDOWN };
