declare module 'simple-update-in' {
  export default function<T, U> (obj: T, patches: string[], patch: (value: U) => U): T;
}
