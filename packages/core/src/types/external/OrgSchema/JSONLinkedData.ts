import { literal, optional, string } from 'valibot';
// import jsonLinkedDataProperties from './private/jsonLinkedDataProperties';

type JSONLinkedDataInput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | string[] | undefined;
  // readonly '@type'?: string | string[] | undefined;
  readonly '@type'?: string | string[] | undefined;
};

type JSONLinkedDataOutput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | undefined;
  // readonly '@type'?: string[];
  readonly '@type'?: string | undefined;
};

const jsonLinkedDataEntries = {
  '@context': optional(literal('https://schema.org')),
  '@id': optional(string()),
  // We should move to multiple @type soon.
  // '@type': jsonLinkedDataProperties(string())
  '@type': optional(string())
};

export { jsonLinkedDataEntries, type JSONLinkedDataInput, type JSONLinkedDataOutput };
