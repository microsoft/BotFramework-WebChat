import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { Children, type ComponentType, type ReactNode } from 'react';

import useStyleSet from '../hooks/useStyleSet';
import Chevron from './private/Chevron';

const { useLocalizer } = hooks;
const { count: childrenCount, map: childrenMap } = Children;

type Props<TAccessoryProps> = Readonly<{
  accessoryComponentType: ComponentType<TAccessoryProps>;
  accessoryProps: TAccessoryProps;
  children?: ReactNode | undefined;
}>;

const REFERENCE_LIST_HEADER_IDS = {
  one: 'REFERENCE_LIST_HEADER_ONE',
  few: 'REFERENCE_LIST_HEADER_FEW',
  many: 'REFERENCE_LIST_HEADER_MANY',
  other: 'REFERENCE_LIST_HEADER_OTHER',
  two: 'REFERENCE_LIST_HEADER_TWO'
};

const LinkDefinitions = <TAccessoryProps extends object>({
  accessoryComponentType,
  accessoryProps,
  children
}: Props<TAccessoryProps>) => {
  const [{ linkDefinitions }] = useStyleSet();
  const localizeWithPlural = useLocalizer({ plural: true });

  const headerText = localizeWithPlural(REFERENCE_LIST_HEADER_IDS, childrenCount(children));

  return (
    <details className={classNames(linkDefinitions, 'webchat__link-definitions')} open={true}>
      <summary className="webchat__link-definitions__header">
        <div className="webchat__link-definitions__header-text">{headerText}</div>
        <Chevron />
        <div className="webchat__link-definitions__header-filler" />
        {accessoryComponentType && (
          <div className="webchat__link-definitions__header-accessory">
            {React.createElement(accessoryComponentType, accessoryProps)}
          </div>
        )}
      </summary>
      <div className="webchat__link-definitions__list" role="list">
        {childrenMap(children, child => (
          <div className="webchat__link-definitions__list-item" role="listitem">
            {child}
          </div>
        ))}
      </div>
    </details>
  );
};

LinkDefinitions.displayName = 'LinkDefinitions';

// TODO: [P1] Add memo().
export default LinkDefinitions;
