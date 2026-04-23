export type Inputize<
  T extends {
    [key in keyof T]?: T[key] extends ReadonlyArray<any> | Array<any> ? never : T[key];
  }
> = {
  [key in keyof T]+?: key extends `@${string}` ? T[key] | undefined : T[key] | readonly T[key][] | undefined;
};

export type Outputize<
  T extends {
    [key in keyof T]?: T[key] extends ReadonlyArray<any> | Array<any> ? never : T[key];
  }
> = {
  [key in keyof T]+?: key extends `@${string}` ? T[key] | undefined : readonly T[key][] | undefined;
};
