import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo } from 'react';

import { type Claim, hasText } from '../../../../types/external/SchemaOrg/Claim';
import { useStyleSet } from '../../../../hooks';
import Chevron from './private/Chevron';
import CitationItem from './private/CitationItem';
import Badge from './private/Badge';
import URLItem from './private/URLItem';

const { useLocalizer } = hooks;

type Props = {
  claims: ReadonlyArray<Claim>;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  onCitationClick?: (citation: Claim & { text: string }) => void;
};

const REFERENCE_LIST_HEADER_IDS = {
  one: 'REFERENCE_LIST_HEADER_ONE',
  few: 'REFERENCE_LIST_HEADER_FEW',
  many: 'REFERENCE_LIST_HEADER_MANY',
  other: 'REFERENCE_LIST_HEADER_OTHER',
  two: 'REFERENCE_LIST_HEADER_TWO'
};

const LinkDefinitions = memo(({ claims, onCitationClick }: Props) => {
  const [{ linkDefinitions }] = useStyleSet();
  const localizeWithPlural = useLocalizer({ plural: true });
  const headerText = localizeWithPlural(REFERENCE_LIST_HEADER_IDS, claims.length);

  return claims.length > 0 ? (
    <details className={classNames(linkDefinitions, 'webchat__link-definitions')} open={true}>
      <summary className="webchat__link-definitions__header">
        {headerText} <Chevron />
      </summary>
      <ul className="webchat__link-definitions__body">
        {claims.map((claim, index) => (
          <li className="webchat__link-definitions__item" key={claim['@id'] || index}>
            {claim.alternateName && <Badge value={claim.alternateName} />}
            {hasText(claim) ? <CitationItem claim={claim} onClick={onCitationClick} /> : <URLItem claim={claim} />}
          </li>
        ))}
      </ul>
    </details>
  ) : null;
});

LinkDefinitions.displayName = 'LinkDefinitions';

export default LinkDefinitions;
