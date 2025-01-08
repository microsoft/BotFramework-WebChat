import { type OrgSchemaCreativeWork } from 'botframework-webchat-core';

/**
 * Type guard to check if the isBasedOn field is of type SoftwareSourceCode
 * @param messageEntity The message entity to check
 * @returns True if isBasedOn is of type SoftwareSourceCode, false otherwise
 */
export default function isBasedOnSoftwareSourceCode(
  messageEntity?: OrgSchemaCreativeWork
): messageEntity is OrgSchemaCreativeWork & { isBasedOn: SoftwareSourceCode } {
  return messageEntity?.isBasedOn?.['@type'] === 'SoftwareSourceCode';
}

interface SoftwareSourceCode {
  '@type': 'SoftwareSourceCode';
  programmingLanguage: string;
  text: string;
}
