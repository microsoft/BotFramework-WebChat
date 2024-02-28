import { isOrgSchemaThingOf, type OrgSchemaCertification, type OrgSchemaClaim } from 'botframework-webchat-core';
import React, { memo } from 'react';

import Badge from './Badge';
import OpenInNewWindowIcon from './OpenInNewWindowIcon';

type Props = Readonly<{
  claim?: OrgSchemaClaim | undefined;
  identifier: string;
  isExternal?: boolean;
  title: string;
}>;

function isCertification(thing: unknown, currentContext?: string | undefined): thing is OrgSchemaCertification {
  return isOrgSchemaThingOf<OrgSchemaCertification>(thing, 'Certification', currentContext);
}

const ItemBody = memo(({ claim, identifier, isExternal, title }: Props) => {
  const usageInfo = claim?.associatedMedia?.usageInfo;

  const certification = isCertification(usageInfo, claim?.associatedMedia?.['@context'] || claim?.['@context'])
    ? usageInfo
    : undefined;

  return (
    <div className="webchat__link-definitions__list-item-body">
      {identifier ? <Badge value={identifier} /> : null}
      <div className="webchat__link-definitions__list-item-body-main">
        <div className="webchat__link-definitions__list-item-main-text">
          <div className="webchat__link-definitions__list-item-text" title={title}>
            {title}
          </div>
          {isExternal ? <OpenInNewWindowIcon className="webchat__link-definitions__open-in-new-window-icon" /> : null}
        </div>
        {certification && (
          <div
            className="webchat__link-definitions__list-item-badge"
            title={[certification.name, certification.description].filter(Boolean).join('\n')}
          >
            {certification.name}
          </div>
        )}
      </div>
    </div>
  );
});

ItemBody.displayName = 'ItemBody';

export default ItemBody;
