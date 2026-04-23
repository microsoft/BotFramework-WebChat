import {
  orgSchemaSoftwareSourceCodeSchema,
  type OrgSchemaCreativeWork,
  type OrgSchemaSoftwareSourceCode
} from 'botframework-webchat-core';
import { safeParse } from 'valibot';

/**
 * Finds the first `isBasedOf` element that is of type `SoftwareSourceCode`.
 *
 * @param messageThing The `CreativeWork` to find.
 * @returns A `SoftwareSourceCode` if found, otherwise, `undefined`.
 */
export default function getFirstBaseOfSoftwareSourceCode(
  messageThing: OrgSchemaCreativeWork
): OrgSchemaSoftwareSourceCode | undefined {
  for (const base of messageThing.isBasedOn) {
    const result = safeParse(orgSchemaSoftwareSourceCodeSchema, base);

    if (result.success) {
      return result.output;
    }
  }
}
