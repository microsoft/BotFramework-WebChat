import setMetaTag from '../dom-utils/setMetaTag';

type BaseBuildInfoObject = {
  readonly buildTool?: string | undefined;
  readonly moduleFormat?: string | undefined;
  readonly version?: string | undefined;
};

interface ReadonlyBuildInfo {
  get name(): string;
  get readonlyObject(): BaseBuildInfoObject;
  get version(): string | undefined;

  delete(key: string): void;
  get(key: string): string | undefined;
  set(key: 'variant', value: 'full' | 'full-es5' | 'minimal'): void;
  set(key: string, value: string | undefined): void;
}

class BuildInfo implements ReadonlyBuildInfo {
  constructor(name: string) {
    this.#name = name;
  }

  #map = new Map<string, string | undefined>();
  #name: string;
  #object: BaseBuildInfoObject = {};

  get name() {
    return this.#name;
  }

  get readonlyObject() {
    return this.#object;
  }

  get version(): string | undefined {
    return this.#map.get('version');
  }

  #commit() {
    setMetaTag(this.name, this.#map);
  }

  delete(key: string) {
    this.#map.delete(key);
  }

  get(key: string): string | undefined {
    return this.#map.get(key);
  }

  set(key: string, value: string | undefined): void {
    this.#map.set(key, value);

    Object.defineProperty(this.#object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: false
    });

    this.#commit();
  }
}

function createBuildInfo(name: `botframework-webchat:${string}`): ReadonlyBuildInfo {
  return new BuildInfo(name);
}

export default createBuildInfo;
export { type BuildInfo, type ReadonlyBuildInfo };
