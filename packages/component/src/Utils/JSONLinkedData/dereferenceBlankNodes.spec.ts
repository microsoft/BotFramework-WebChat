/// <reference types="jest" />

import dereferenceBlankNodes from './dereferenceBlankNodes';

test('should leave non-blank node as-is', () => {
  const object = {
    '@type': 'Thing',
    first: { '@type': 'Thing' },
    second: { '@type': 'Thing', text: 'Hello, World!' },
    third: { text: 'Aloha!' }
  };

  const input = [object];
  const output = dereferenceBlankNodes(input);

  expect(output).not.toBe(input);

  const [nextObject] = output as any;

  expect(nextObject).not.toBe(object);

  expect(nextObject).toEqual({
    '@type': 'Thing',
    first: { '@type': 'Thing' },
    second: { '@type': 'Thing', text: 'Hello, World!' },
    third: { text: 'Aloha!' }
  });

  expect(Object.isFrozen(nextObject)).toBe(true);
  expect(Object.isFrozen(nextObject.first)).toBe(true);
  expect(Object.isFrozen(nextObject.second)).toBe(true);
  expect(Object.isFrozen(nextObject.third)).toBe(true);
});

test('should dereference unconnected blank nodes in cyclic fashion', () => {
  const object = {
    '@type': 'Book',
    author: {
      '@type': 'Person',
      '@id': '_:isaac',
      name: 'Isaac Stevens',
      worksFor: { '@type': 'Organization', '@id': '_:uw' }
    },
    name: 'Report of Explorations for a Route for the Pacific Railroad near the 47th and 49th Parallels of North Latitude, from St. Paul, Minnesota, to Puget Sound',
    sourceOrganization: {
      '@type': 'Organization',
      '@id': '_:uw',
      name: 'University of Washington',
      founder: { '@type': 'Person', '@id': '_:isaac' }
    }
  };

  const input = [object];
  const output = dereferenceBlankNodes(input);

  expect(output).not.toBe(input);

  const [nextObject] = output as any;

  expect(nextObject).toMatchSnapshot();

  expect(nextObject).not.toBe(object);
  expect(nextObject.author).not.toBe(object.author);
  expect(nextObject.sourceOrganization).not.toBe(object.sourceOrganization);

  expect(nextObject.author.worksFor).toBe(nextObject.sourceOrganization);
  expect(nextObject.sourceOrganization.founder).toBe(nextObject.author);

  expect(nextObject.author.name).toBe('Isaac Stevens');
  expect(nextObject.author.worksFor.name).toBe('University of Washington');
  expect(nextObject.sourceOrganization.name).toBe('University of Washington');
  expect(nextObject.sourceOrganization.founder.name).toBe('Isaac Stevens');

  expect(Object.isFrozen(nextObject)).toBe(true);
  expect(Object.isFrozen(nextObject.author)).toBe(true);
  expect(Object.isFrozen(nextObject.sourceOrganization)).toBe(true);
});

test('should dereference unconnected blank nodes in array in cyclic fashion', () => {
  const object = {
    '@type': 'Book',
    author: { '@type': 'Person', name: 'Edmond S. Meany' },
    about: [
      {
        '@type': 'Person',
        '@id': '_:isaac',
        name: 'Isaac Stevens',
        worksFor: {
          '@type': 'Organization',
          '@id': '_:uw',
          name: 'University of Washington',
          founder: { '@type': 'Person', '@id': '_:isaac' }
        }
      },
      {
        '@type': 'Organization',
        '@id': '_:uw'
      }
    ],
    name: 'Governors of Washington: territorial and state'
  };

  const input = [object];
  const output = dereferenceBlankNodes(input);

  expect(output).not.toBe(input);

  const [nextObject] = output as any;

  expect(nextObject).not.toBe(object);
  expect(nextObject).toMatchSnapshot();

  expect(nextObject.about[0].worksFor).toBe(nextObject.about[1]);
  expect(nextObject.about[1].founder).toBe(nextObject.about[0]);

  expect(nextObject.about[0].name).toBe('Isaac Stevens');
  expect(nextObject.about[0].worksFor.name).toBe('University of Washington');
  expect(nextObject.about[1].name).toBe('University of Washington');
  expect(nextObject.about[1].founder.name).toBe('Isaac Stevens');
});

test('should dereference unconnected blank nodes in the graph', () => {
  const input = [
    {
      '@type': 'Person',
      '@id': '_:isaac',
      name: 'Isaac Stevens',
      worksFor: {
        '@type': 'Organization',
        '@id': '_:uw',
        name: 'University of Washington',
        founder: { '@type': 'Person', '@id': '_:isaac' }
      }
    },
    {
      '@type': 'Organization',
      '@id': '_:uw'
    }
  ];

  const output = dereferenceBlankNodes(input) as any;

  expect(output).not.toBe(input);
  expect(output).toMatchSnapshot();

  expect(output[0].worksFor).toBe(output[1]);
  expect(output[1].founder).toBe(output[0]);

  expect(output[0].name).toBe('Isaac Stevens');
  expect(output[0].worksFor.name).toBe('University of Washington');
  expect(output[1].name).toBe('University of Washington');
  expect(output[1].founder.name).toBe('Isaac Stevens');

  expect(Object.isFrozen(output)).toBe(true);
  expect(Object.isFrozen(output[0])).toBe(true);
  expect(Object.isFrozen(output[1])).toBe(true);
});

test('should not dereference unconnectable blank nodes', () => {
  const object = { first: { '@id': '_:a' } };

  const [nextObject] = dereferenceBlankNodes([object]);

  expect(nextObject).toEqual({ first: { '@id': '_:a' } });

  expect(Object.isFrozen(nextObject)).toBe(true);
});

test('should not dereference unconnectable blank nodes in an array', () => {
  const object = { first: [{ '@id': '_:a' }] };

  const [nextObject] = dereferenceBlankNodes([object]);

  expect(nextObject).toEqual({ first: [{ '@id': '_:a' }] });

  expect(Object.isFrozen(nextObject)).toBe(true);
});
