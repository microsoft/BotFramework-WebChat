import { looseObject, pipe, readonly, string, type GenericSchema } from 'valibot';

import { creativeWorkEntries, type CreativeWorkInput, type CreativeWorkOutput } from './CreativeWork';
import orgSchemaProperties from './private/orgSchemaProperties';

/**
 * Computer programming source code. Example: Full (compile ready) solutions, code snippet samples, scripts, templates.
 *
 * This is partial implementation of https://schema.org/SoftwareSourceCode.
 *
 * @see https://schema.org/SoftwareSourceCode
 */
type SoftwareSourceCodeInput = CreativeWorkInput & {
  /**
   * The computer programming language.
   *
   * @see https://schema.org/programmingLanguage
   */
  readonly programmingLanguage?: string | readonly string[] | undefined;
};

/**
 * Computer programming source code. Example: Full (compile ready) solutions, code snippet samples, scripts, templates.
 *
 * This is partial implementation of https://schema.org/SoftwareSourceCode.
 *
 * @see https://schema.org/SoftwareSourceCode
 */
type SoftwareSourceCodeOutput = CreativeWorkOutput & {
  /**
   * The computer programming language.
   *
   * @see https://schema.org/programmingLanguage
   */
  readonly programmingLanguage: readonly string[];
};

const softwareSourceCodeEntries = {
  ...creativeWorkEntries,
  programmingLanguage: orgSchemaProperties(string())
};

const softwareSourceCodeSchema: GenericSchema<SoftwareSourceCodeInput, SoftwareSourceCodeOutput> = pipe(
  looseObject(softwareSourceCodeEntries),
  readonly()
);

export {
  softwareSourceCodeEntries,
  softwareSourceCodeSchema,
  type SoftwareSourceCodeInput,
  type SoftwareSourceCodeOutput
};
