import { isThingAsEntity } from './Thing';

// 1. Must be a Thing ("@context", "@type" and/or "currentContext")
// 2. Must have "type" of "https://schema.org/*"
test.each([
  // Permute "@context".
  [false, 'https://example.com', 'Person', 'https://example.com/Something', 'https://example.com'],
  [false, 'https://schema.org', 'Person', 'https://example.com/Something', 'https://example.com'],
  [false, undefined, 'Person', 'https://example.com/Something', 'https://example.com'],

  // Permute "@type".
  [false, 'https://example.com', undefined, 'https://example.com/Something', 'https://example.com'],
  [false, 'https://schema.org', undefined, 'https://example.com/Something', 'https://example.com'],
  [false, undefined, undefined, 'https://example.com/Something', 'https://example.com'],

  // Permute "type".
  [false, 'https://example.com', 'Person', 'https://schema.org/Person', 'https://example.com'],
  [true, 'https://schema.org', 'Person', 'https://schema.org/Person', 'https://example.com'],
  [false, undefined, 'Person', 'https://schema.org/Person', 'https://example.com'],

  [false, 'https://example.com', undefined, 'https://schema.org/Person', 'https://example.com'],
  [false, 'https://schema.org', undefined, 'https://schema.org/Person', 'https://example.com'],
  [false, undefined, undefined, 'https://schema.org/Person', 'https://example.com'],

  [false, 'https://example.com', 'Person', undefined, 'https://example.com'],
  [false, 'https://schema.org', 'Person', undefined, 'https://example.com'],
  [false, undefined, 'Person', undefined, 'https://example.com'],

  [false, 'https://example.com', undefined, undefined, 'https://example.com'],
  [false, 'https://schema.org', undefined, undefined, 'https://example.com'],
  [false, undefined, undefined, undefined, 'https://example.com'],

  // Permute "currentContext".
  [false, 'https://example.com', 'Person', 'https://example.com/Something', 'https://schema.org'],
  [false, 'https://schema.org', 'Person', 'https://example.com/Something', 'https://schema.org'],
  [false, undefined, 'Person', 'https://example.com/Something', 'https://schema.org'],

  [false, 'https://example.com', undefined, 'https://example.com/Something', 'https://schema.org'],
  [false, 'https://schema.org', undefined, 'https://example.com/Something', 'https://schema.org'],
  [false, undefined, undefined, 'https://example.com/Something', 'https://schema.org'],

  [false, 'https://example.com', 'Person', 'https://schema.org/Person', 'https://schema.org'],
  [true, 'https://schema.org', 'Person', 'https://schema.org/Person', 'https://schema.org'],
  [true, undefined, 'Person', 'https://schema.org/Person', 'https://schema.org'],

  [false, 'https://example.com', undefined, 'https://schema.org/Person', 'https://schema.org'],
  [false, 'https://schema.org', undefined, 'https://schema.org/Person', 'https://schema.org'],
  [false, undefined, undefined, 'https://schema.org/Person', 'https://schema.org'],

  [false, 'https://example.com', 'Person', undefined, 'https://schema.org'],
  [false, 'https://schema.org', 'Person', undefined, 'https://schema.org'],
  [false, undefined, 'Person', undefined, 'https://schema.org'],

  [false, 'https://example.com', undefined, undefined, 'https://schema.org'],
  [false, 'https://schema.org', undefined, undefined, 'https://schema.org'],
  [false, undefined, undefined, undefined, 'https://schema.org'],

  [false, 'https://example.com', 'Person', 'https://example.com/Something', undefined],
  [false, 'https://schema.org', 'Person', 'https://example.com/Something', undefined],
  [false, undefined, 'Person', 'https://example.com/Something', undefined],

  [false, 'https://example.com', undefined, 'https://example.com/Something', undefined],
  [false, 'https://schema.org', undefined, 'https://example.com/Something', undefined],
  [false, undefined, undefined, 'https://example.com/Something', undefined],

  [false, 'https://example.com', 'Person', 'https://schema.org/Person', undefined],
  [true, 'https://schema.org', 'Person', 'https://schema.org/Person', undefined],
  [false, undefined, 'Person', 'https://schema.org/Person', undefined],

  [false, 'https://example.com', undefined, 'https://schema.org/Person', undefined],
  [false, 'https://schema.org', undefined, 'https://schema.org/Person', undefined],
  [false, undefined, undefined, 'https://schema.org/Person', undefined],

  [false, 'https://example.com', 'Person', undefined, undefined],
  [false, 'https://schema.org', 'Person', undefined, undefined],
  [false, undefined, 'Person', undefined, undefined],

  [false, 'https://example.com', undefined, undefined, undefined],
  [false, 'https://schema.org', undefined, undefined, undefined],
  [false, undefined, undefined, undefined, undefined]
] as const)(
  `isThingAsEntity() should return %s with candidate of @context=%s, @type=%s, type=%s, currentContext=%s`,
  (
    expected: boolean,
    atContext: 'https://example.com' | 'https://schema.org' | undefined,
    atType: 'Person' | undefined,
    type: 'https://example.com/Something' | 'https://schema.org/Person' | undefined,
    currentContext: 'https://example.com' | 'https://schema.org' | undefined
  ) =>
    expect(
      isThingAsEntity(
        {
          '@context': atContext,
          '@type': atType,
          type
        },
        currentContext
      )
    ).toBe(expected)
);
