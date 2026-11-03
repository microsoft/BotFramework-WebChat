import { literal, object, optional, string, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';

type JSONLinkedDataInput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | readonly string[] | undefined;
  readonly '@type'?: string | readonly string[] | undefined;
};

type JSONLinkedDataOutput = {
  readonly '@context'?: 'https://schema.org' | undefined;
  readonly '@id'?: string | undefined;
  readonly '@type': readonly string[];
};

const jsonLinkedDataSchema: GenericSchema<JSONLinkedDataInput, JSONLinkedDataOutput> = object({
  '@context': optional(literal('https://schema.org')),
  '@id': optional(string()),
  '@type': jsonLinkedDataProperty(string())
});

export { jsonLinkedDataSchema, type JSONLinkedDataInput, type JSONLinkedDataOutput };
