import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import random from 'math-random';
import React, {
  Children,
  useCallback,
  useRef,
  useState,
  type ComponentType,
  type ReactEventHandler,
  type ReactNode
} from 'react';

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

function uniqueId(count = Infinity) {
  return (
    random()
      // eslint-disable-next-line no-magic-numbers
      .toString(36)
      // eslint-disable-next-line no-magic-numbers
      .substring(2, 2 + count)
  );
}

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const LinkDefinitions = <TAccessoryProps extends {}>({
  accessoryComponentType,
  accessoryProps,
  children
}: Props<TAccessoryProps>) => {
  const [id] = useState(() => `webchat-link-definitions-${uniqueId()}`);
  const [{ linkDefinitions }] = useStyleSet();
  const localizeWithPlural = useLocalizer({ plural: true });
  const summaryRef = useRef<HTMLElement>(null);

  const headerText = localizeWithPlural(REFERENCE_LIST_HEADER_IDS, childrenCount(children));

  const handleToggle = useCallback<ReactEventHandler<HTMLDetailsElement>>(event => {
    const summary = summaryRef.current;
    const details = event.target;
    if (summary && details && details instanceof HTMLDetailsElement) {
      const isDetailsOpen = details.open.toString();
      summary.setAttribute('aria-expanded', isDetailsOpen);
      summary.setAttribute('aria-pressed', isDetailsOpen);
    }
  }, []);

  return (
    <details
      className={classNames(linkDefinitions, 'webchat__link-definitions')}
      // eslint-disable-next-line react/forbid-dom-props
      id={id}
      onToggle={handleToggle}
      open={true}
    >
      <summary
        aria-controls={id}
        aria-expanded="true"
        aria-pressed="true"
        className="webchat__link-definitions__header"
        ref={summaryRef}
        role="button"
      >
        <div className="webchat__link-definitions__header-section webchat__link-definitions__header-section--left">
          <div className="webchat__link-definitions__header-text">{headerText}</div>
          <Chevron />
        </div>
        <div className="webchat__link-definitions__header-section webchat__link-definitions__header-section--right">
          {accessoryComponentType && (
            <div className="webchat__link-definitions__header-accessory">
              {React.createElement(accessoryComponentType, accessoryProps)}
            </div>
          )}
        </div>
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
