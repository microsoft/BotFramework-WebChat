export default function numberWithInfinity(value: number | 'Infinity' | '-Infinity'): number;
export default function numberWithInfinity(value: unknown): undefined;

export default function numberWithInfinity(value: number | 'Infinity' | '-Infinity' | unknown): number | undefined {
  switch (value) {
    case 'Infinity':
      return Infinity;

    case '-Infinity':
      return -Infinity;

    default:
      return typeof value === 'number' ? value : undefined;
  }
}
