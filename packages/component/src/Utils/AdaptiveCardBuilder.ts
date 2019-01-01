import {
  AdaptiveCard,
  CardElement,
  Column,
  ColumnSet,
  Container,
  Image,
  OpenUrlAction,
  Size,
  SubmitAction,
  TextBlock,
  TextSize,
  TextWeight
} from 'adaptivecards';

import { CardAction } from 'botframework-directlinejs';

export interface BotFrameworkCardAction extends CardAction {
  __isBotFrameworkCardAction: boolean;
}

function addCardAction(cardAction: CardAction, includesOAuthButtons?: boolean) {
  if (cardAction.type === 'imBack' || cardAction.type === 'postBack') {
    const action = new SubmitAction();
    const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };

    action.data = botFrameworkCardAction;
    action.title = cardAction.title;

    return action;
  } else if (cardAction.type === 'signin' && includesOAuthButtons) {
    // Create a button specific for OAuthCard 'signin' actions (cardAction.type == signin and button action is Action.Submit)
    const action = new SubmitAction();
    const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };

    action.data = botFrameworkCardAction;
    action.title = cardAction.title;

    return action;
  } else {
    const action = new OpenUrlAction();

    action.title = cardAction.title;
    action.url = cardAction.type === 'call' ? 'tel:' + cardAction.value : cardAction.value;

    return action;
  }
}

export class AdaptiveCardBuilder {
  card: AdaptiveCard;
  container: Container;

  constructor(adaptiveCards) {
    this.card = new adaptiveCards.AdaptiveCard();
    this.container = new Container();

    this.card.addItem(this.container);
  }

  addColumnSet(sizes: number[], container: Container = this.container) {
    const columnSet = new ColumnSet();

    container.addItem(columnSet);

    return sizes.map(size => {
      const column = new Column();

      column.width = size;
      columnSet.addColumn(column);

      return column;
    });
  }

  addItems(cardElements: CardElement[], container: Container = this.container) {
    cardElements.forEach(cardElement => container.addItem(cardElement));
  }

  addTextBlock(text: string, template: Partial<TextBlock>, container: Container = this.container) {
    if (typeof text !== 'undefined') {
      const textblock = new TextBlock();

      // tslint:disable-next-line:forin
      for (const prop in template) {
        (textblock as any)[prop] = (template as any)[prop];
      }

      textblock.speak = text;
      textblock.text = text;
      container.addItem(textblock);
    }
  }

  addButtons(cardActions: CardAction[], includesOAuthButtons?: boolean) {
    cardActions && cardActions.forEach(cardAction => {
      this.card.addAction(addCardAction(cardAction, includesOAuthButtons));
    });
  }

  addCommonHeaders(content: ICommonContent) {
    this.addTextBlock(content.title, { size: TextSize.Medium, weight: TextWeight.Bolder });
    this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
    this.addTextBlock(content.text, { wrap: true });
  }

  addCommon(content: ICommonContent) {
    this.addCommonHeaders(content);
    this.addButtons(content.buttons);
  }

  addImage(url: string, container?: Container, selectAction?: CardAction) {
    container = container || this.container;

    const image = new Image();

    image.url = url;
    image.selectAction = selectAction && addCardAction(selectAction);
    image.size = Size.Stretch;

    container.addItem(image);
  }
}

export interface ICommonContent {
  buttons?: CardAction[];
  subtitle?: string;
  text?: string;
  title?: string;
}
