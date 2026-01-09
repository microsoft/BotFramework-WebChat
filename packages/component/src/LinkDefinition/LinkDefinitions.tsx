import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
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

import { ComponentIcon } from '../Icon';

import styles from './LinkDefinitions.module.css';

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
  const localizeWithPlural = useLocalizer({ plural: true });
  const summaryRef = useRef<HTMLElement>(null);
  const classNames = useStyles(styles);

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
      className={classNames['link-definitions']}
      // eslint-disable-next-line react/forbid-dom-props
      id={id}
      onToggle={handleToggle}
      open={true}
    >
      <summary
        aria-controls={id}
        aria-expanded="true"
        aria-pressed="true"
        className={classNames['link-definitions__header']}
        ref={summaryRef}
        role="button"
      >
        <div
          className={cx(
            classNames['link-definitions__header-section'],
            classNames['link-definitions__header-section--left']
          )}
        >
          <div className={classNames['link-definitions__header-text']}>{headerText}</div>
          <ComponentIcon appearance="text" className={classNames['link-definitions__header-chevron']} icon="chevron" />
        </div>
        <div
          className={cx(
            classNames['link-definitions__header-section'],
            classNames['link-definitions__header-section--right']
          )}
        >
          {accessoryComponentType && (
            <div className={classNames['link-definitions__header-accessory']}>
              {React.createElement(accessoryComponentType, accessoryProps)}
            </div>
          )}
        </div>
      </summary>
      <div className={classNames['link-definitions__list']} role="list">
        {childrenMap(children, child => (
          <div className={classNames['link-definitions__list-item']} role="listitem">
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
