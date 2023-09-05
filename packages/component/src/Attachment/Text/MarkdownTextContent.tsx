import classNames from 'classnames';
import React, { Fragment, memo, useCallback, useMemo } from 'react';

import getClaimsFromMarkdown from './private/getClaimsFromMarkdown';
import LinkDefinitions from './private/ui/LinkDefinitions';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../hooks/useStyleSet';
import useShowModal from '../../providers/ModalDialog/useShowModal';

import { hasText, isClaim, type Claim } from '../../types/external/SchemaOrg/Claim';
import { isThing } from '../../types/external/SchemaOrg/Thing';

import { type WebChatActivity } from 'botframework-webchat-core';

type Props = {
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  activity?: WebChatActivity;
  markdown: string;
};

const MarkdownTextContent = memo(({ activity, markdown }: Props) => {
  const [{ textContent: textContentStyleSet }] = useStyleSet();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  // const showCitationPopover = useShowCitationPopover();
  const showModal = useShowModal();

  if (!renderMarkdownAsHTML) {
    throw new Error('botframework-webchat: assert failed for renderMarkdownAsHTML');
  }

  // Citations are claim with text.
  // We are building a map for quick lookup.
  const citationMap = useMemo<Map<string, Claim & { text: string }>>(
    () =>
      (activity?.entities || []).reduce<Map<string, Claim & { text: string }>>((citationMap, entity) => {
        if (isThing(entity) && isClaim(entity) && hasText(entity) && entity['@id']) {
          return citationMap.set(entity['@id'], entity);
        }

        return citationMap;
      }, new Map()),
    [activity]
  );

  // These are all the claims, including citation (claim with text) and links (claim without text but URL).
  const claims = useMemo(
    () => Object.freeze(Array.from(getClaimsFromMarkdown(markdown, citationMap))),
    [citationMap, markdown]
  );

  // The content rendered by `renderMarkdownAsHTML` is sanitized.
  const dangerouslySetInnerHTML = useMemo(
    () => ({ __html: markdown ? renderMarkdownAsHTML(markdown) : '' }),
    [renderMarkdownAsHTML, markdown]
  );

  const handleClick = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      showModal(() => (
        <Fragment>
          <h1>{'Hello, World! Culpa deserunt in sint eu id sint excepteur.'}</h1>
          <p>
            {
              'Ex aute ullamco labore ad enim minim esse irure reprehenderit. Commodo aliquip incididunt occaecat et amet id quis esse proident eu aliqua tempor esse duis. Ad culpa ipsum et nisi est elit minim nisi amet labore dolor sit.'
            }
          </p>
          <p>
            {
              'Mollit consequat consectetur mollit id id mollit officia proident commodo nisi in. Aute nisi aliqua irure tempor cupidatat sit aliquip Lorem velit incididunt deserunt in ipsum. Quis aliqua incididunt aliquip anim. Ex laboris irure occaecat eu sint aliqua veniam mollit reprehenderit duis.'
            }
          </p>
          <p>
            {
              'Sit excepteur non nisi excepteur eiusmod ipsum mollit quis aute enim et. Enim do minim amet officia minim cupidatat. Excepteur ipsum dolore laborum cillum. Laborum et laboris et esse ad in dolor.'
            }
          </p>
          <p>
            {
              'Enim reprehenderit officia pariatur excepteur. In elit eu nostrud eu. Do aute occaecat nisi id nostrud sunt in ipsum enim mollit.'
            }
          </p>
          <p>
            {
              'Excepteur sit occaecat reprehenderit eiusmod proident nulla id id. Ad ipsum reprehenderit labore irure irure sit dolor excepteur aliqua non sint enim. In culpa excepteur anim reprehenderit nulla duis velit. Aute dolore velit pariatur occaecat deserunt consequat consectetur nulla id. Duis sit anim eu anim id sint enim.'
            }
          </p>
          <p>
            {
              'Consectetur labore nulla do consequat magna esse officia. Consequat nostrud velit irure esse elit ad veniam ex id eiusmod officia. Quis commodo adipisicing et minim cupidatat consectetur est dolore id proident commodo ipsum. Dolore ex culpa cupidatat duis. Ad Lorem voluptate duis veniam elit cillum sunt sit. Irure et culpa laboris sint ut occaecat tempor commodo anim.'
            }
          </p>
          <p>
            {
              'Cupidatat laboris dolor esse proident pariatur cillum velit commodo veniam tempor dolore excepteur. Amet est qui labore reprehenderit non pariatur ullamco cillum ea anim. Consectetur voluptate sit consequat ad sunt elit. Est reprehenderit quis sint est consectetur laborum occaecat ut dolor sint cupidatat voluptate.'
            }
          </p>
          <p>
            {
              'Deserunt enim duis pariatur mollit velit quis pariatur eiusmod dolor aute culpa amet sunt. Dolore do cillum exercitation fugiat sunt labore deserunt sunt. Quis ipsum dolore nulla cillum officia excepteur qui consectetur sint anim eu exercitation cupidatat anim. Laborum incididunt adipisicing sint consectetur nulla officia proident. Duis ea amet irure voluptate quis ad ad consequat laborum velit. Enim tempor sit eu nisi anim cillum magna nisi enim officia. Qui nulla tempor aliquip proident est esse pariatur duis sunt laboris ipsum laborum eu aliqua.'
            }
          </p>
          <p>
            {
              'Ut proident labore qui aute. In eiusmod labore laboris velit sint ullamco ullamco enim qui non. Non ex fugiat non dolor ea do laborum. Culpa ea mollit sunt velit adipisicing sit reprehenderit elit amet ut aute laborum dolore anim. Aliqua excepteur consequat nisi laborum dolor nisi eiusmod ullamco sint dolore et ad pariatur cupidatat. Laboris nostrud veniam cupidatat et consequat ut dolore ea quis exercitation incididunt. Anim duis fugiat Lorem duis nostrud et nisi esse aute esse ut cupidatat ex.'
            }
          </p>
          <p>
            {
              'Nisi veniam mollit irure do reprehenderit nisi magna excepteur. Proident cupidatat incididunt reprehenderit eiusmod eu quis ut ipsum ut consequat consequat. Consectetur dolore esse proident nulla ipsum aliquip enim ipsum fugiat reprehenderit mollit commodo voluptate tempor. Elit occaecat nostrud aute occaecat sit est irure. Consectetur aute anim do do minim id ut cupidatat exercitation velit non. In sit ex adipisicing ad mollit ad sunt ipsum elit adipisicing ullamco pariatur fugiat.'
            }
          </p>
          <p>
            {
              'Culpa cupidatat minim dolor proident sint eiusmod dolore nulla voluptate nisi commodo do. Reprehenderit laboris nisi tempor in culpa non dolore tempor duis tempor. Elit aliquip deserunt sit in cillum duis adipisicing culpa cupidatat proident. Nostrud in fugiat anim commodo commodo et pariatur. Voluptate occaecat ex proident veniam cillum ea. Cupidatat labore ullamco nulla commodo pariatur ea voluptate tempor ullamco.'
            }
          </p>
          <p>
            {
              'Cillum ex enim consectetur minim qui cupidatat cupidatat. Sint minim dolore proident do et et nostrud dolore. Officia in consectetur irure amet mollit irure. Esse consequat velit Lorem non officia cillum velit. Dolore cupidatat et veniam anim minim qui.'
            }
          </p>
          <p>
            {
              'Nisi deserunt in aliquip ad. Commodo occaecat adipisicing ea voluptate cupidatat reprehenderit labore eiusmod occaecat. Adipisicing dolor aliqua ad ut. Enim fugiat in commodo consequat commodo dolore. Non proident sit ipsum sunt do non incididunt ullamco dolore velit. Exercitation aute culpa mollit enim laboris id aliqua voluptate id id dolore enim.'
            }
          </p>
          <p>
            {
              'Cillum adipisicing nostrud deserunt adipisicing consequat minim anim reprehenderit et dolor pariatur veniam ullamco do. Aliqua ex et exercitation esse incididunt excepteur ad consectetur velit sunt qui ullamco. Nostrud do dolore incididunt et ex nostrud. Anim do id qui mollit dolore excepteur consectetur sint consectetur mollit. Consectetur et aliqua incididunt elit consectetur deserunt incididunt velit magna quis pariatur do eiusmod non.'
            }
          </p>
          <p>
            {
              'Ullamco est dolor ullamco ipsum ullamco qui eu sunt veniam consequat exercitation. Minim quis magna aliquip aliquip officia amet reprehenderit. Minim sunt consequat dolore amet exercitation exercitation voluptate tempor. Proident esse culpa laboris exercitation Lorem sint consectetur excepteur laborum excepteur. Nisi id do commodo non exercitation eiusmod elit et enim nostrud laborum sint consectetur culpa.'
            }
          </p>
          <p>
            {
              'Aliquip officia non nostrud minim dolor. Commodo magna in ea sunt aliqua anim elit. Ea ad nisi est elit quis. Reprehenderit minim Lorem irure ea pariatur dolore adipisicing incididunt labore proident. Officia laborum esse Lorem duis mollit occaecat incididunt magna esse ex consectetur nostrud dolore. Sunt qui labore ullamco aute aliqua. Labore veniam nulla enim enim commodo commodo exercitation incididunt minim anim.'
            }
          </p>
          <p>
            {
              'Consequat nostrud ex fugiat et in. Amet non dolor id ad ullamco do in anim id excepteur in minim eu. Adipisicing laboris aliqua aliqua labore eu.'
            }
          </p>
          <p>
            {
              'Consectetur enim consectetur nulla ut duis. Culpa excepteur cupidatat do dolor ut aliquip amet. Occaecat ex esse qui velit ex aliqua. Ut amet exercitation enim culpa ea aute do qui laborum quis aliqua. Quis et esse elit eu dolor minim sit adipisicing exercitation culpa mollit amet. Deserunt exercitation Lorem consequat ullamco eiusmod. Deserunt reprehenderit sit quis pariatur irure cillum esse commodo esse.'
            }
          </p>
          <p>
            {
              'Sunt enim aliqua magna commodo mollit. Irure ipsum nostrud veniam non id aliquip id. Et occaecat fugiat eiusmod esse enim laboris consequat.'
            }
          </p>
          <p>
            <a href="https://bing.com/" rel="noopener noreferrer" target="_blank">
              {'Duis'}
            </a>
            {
              ' deserunt ea aliqua ad nulla mollit incididunt aute mollit. Laborum enim cupidatat culpa cillum exercitation. Voluptate excepteur sit commodo aliquip pariatur aliquip. Nostrud laborum nostrud qui enim amet veniam sunt sint. Et ea mollit mollit proident do laborum sit enim pariatur amet occaecat nostrud. Anim proident incididunt nulla adipisicing sit voluptate fugiat cillum nisi minim. Eu incididunt excepteur consectetur excepteur excepteur quis laboris.'
            }
          </p>
        </Fragment>
      ));

      // showCitationPopover({
      //   '@context': 'https://schema.org/',
      //   '@type': 'Claim',
      //   type: 'https://schema.org/Claim',
      //   text: 'Hello, World!'
      // });
    },
    [showModal]
  );

  return (
    <div
      // TODO: Fix this class name.
      className={classNames('webchat__markdown', textContentStyleSet + '')}
    >
      <div
        className="webchat__markdown__body"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        onClick={handleClick}
      />
      <LinkDefinitions claims={claims} />
    </div>
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
