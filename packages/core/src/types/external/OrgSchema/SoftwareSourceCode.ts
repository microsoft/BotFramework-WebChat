import { intersect, lazy, object, string, type GenericSchema } from 'valibot';

import { creativeWorkSchema, type CreativeWorkInput, type CreativeWorkOutput } from './CreativeWork';
import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';

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

const softwareSourceCodeSchema: GenericSchema<SoftwareSourceCodeInput, SoftwareSourceCodeOutput> = intersect([
  lazy(() => creativeWorkSchema),
  object({
    programmingLanguage: jsonLinkedDataProperty(string())
  })
]);

export { softwareSourceCodeSchema, type SoftwareSourceCodeInput, type SoftwareSourceCodeOutput };
