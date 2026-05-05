import { intersect, lazy, object, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
import { creativeWorkSchema, type CreativeWorkInput, type CreativeWorkOutput } from './CreativeWork';

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

const softwareSourceCodeSchema: GenericSchema<SoftwareSourceCodeInput, SoftwareSourceCodeOutput> = pipe(
  intersect([
    pipe(
      lazy(() => creativeWorkSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      programmingLanguage: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

export { softwareSourceCodeSchema, type SoftwareSourceCodeInput, type SoftwareSourceCodeOutput };
