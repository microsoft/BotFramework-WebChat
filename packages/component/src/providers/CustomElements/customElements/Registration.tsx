import React, {
  type Ref,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const registrations = new Map<string, Registration>();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'registration-root': HTMLAttributes<HTMLElement> & {
        children: ReactNode;
        ref: Ref<HTMLElement>;
      };
    }
  }
}

export interface RegistrationInstance {
  render: (children: ReactNode) => ReactNode;
  dispose?: () => void;
}

interface RegistrationModule {
  new (root: HTMLElement, registration: Registration): RegistrationInstance;
}

class Registration {
  from: string;
  elements: Map<HTMLElement, (instance: RegistrationInstance) => void> = new Map();
  initialized: boolean = false;
  module!: { default: RegistrationModule };

  constructor(from: string) {
    this.from = from;

    this.init();
  }

  async init() {
    try {
      const module = await import(this.from);
      if (typeof module.default !== 'function') {
        throw new Error('Web Chat Registration: Unsupported registration definition');
      }

      this.module = module;
      this.initialized = true;

      for (const [element, setInstance] of this.elements.entries()) {
        this.add(element, setInstance);
      }
    } catch (error) {
      console.error('Web Chat Registration: Unable to perform registration:', this.from, error);
    }
  }

  add(element: HTMLElement, setInstance: (instance: RegistrationInstance) => void) {
    this.elements.set(element, setInstance);

    if (this.initialized && this.module) {
      const instance = new this.module.default(element, this);
      setInstance(instance);
    }
  }

  remove(element: HTMLElement) {
    this.elements.delete(element);

    if (this.elements.size === 0) {
      registrations.delete(this.from);
    }
  }
}

export const ReactRegistration = ({ children, from }: Readonly<{ from: string; children?: ReactNode }>) => {
  const [instance, setInstance] = useState<RegistrationInstance | null>(null);
  const instanceRef = useRef<RegistrationInstance | null>(null);

  const updateInstance = useCallback((inst: RegistrationInstance | null) => {
    setInstance(inst);
    instanceRef.current = inst;
  }, []);

  const registration = useMemo<Registration>(() => {
    const isDefined = registrations.has(from);
    const reg = isDefined ? registrations.get(from)! : new Registration(from);

    !isDefined && registrations.set(from, reg);

    return reg;
  }, [from]);

  const elementRegistrationRef = useRef<{ element: HTMLElement; registration: Registration } | null>(null);

  const handleRemove = useCallback(() => {
    if (!elementRegistrationRef.current) {
      return;
    }

    const { element, registration: reg } = elementRegistrationRef.current;

    instanceRef.current && typeof instanceRef.current.dispose === 'function' && instanceRef.current.dispose();
    reg.remove(element);
    elementRegistrationRef.current = null;
    updateInstance(null);
  }, [updateInstance]);

  const elementRef = useCallback(
    (element: HTMLElement | null) => {
      handleRemove();

      if (element) {
        elementRegistrationRef.current = { element, registration };
        registration.add(element, updateInstance);
      }
    },
    [handleRemove, registration, updateInstance]
  );

  useEffect(() => handleRemove, [handleRemove]);

  return (
    <registration-root ref={elementRef}>
      {instance && typeof instance.render === 'function' ? instance.render(children) : children}
    </registration-root>
  );
};

ReactRegistration.displayName = 'Registration';
