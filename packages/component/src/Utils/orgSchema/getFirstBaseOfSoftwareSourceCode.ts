import { type OrgSchemaCreativeWork, type OrgSchemaSoftwareSourceCode } from 'botframework-webchat-core';

/**
 * Finds the first `isBasedOf` element that is of type `SoftwareSourceCode`.
 *
 * @param messageThing The `CreativeWork` to find.
 * @returns A `SoftwareSourceCode` if found, otherwise, `undefined`.
 */
export default function getFirstBaseOfSoftwareSourceCode(
  messageThing: OrgSchemaCreativeWork | undefined
): OrgSchemaSoftwareSourceCode | undefined {
  return (messageThing?.isBasedOn ?? []).find(
    ({ '@type': jsonLinkedDataType }) => jsonLinkedDataType === 'SoftwareSourceCode'
  );
}
