import {
  AdaptiveCard,
  CardElement,
  Column,
  ColumnSet,
  Container,
  Image,
  OpenUrlAction,
  Size,
  SizeAndUnit,
  SubmitAction,
  TextBlock,
  TextColor,
  TextSize,
  TextWeight
} from 'adaptivecards';

import { CardAction } from 'botframework-directlinejs';

export interface BotFrameworkCardAction {
  __isBotFrameworkCardAction: boolean;
  cardAction: CardAction;
}

function addCardAction(cardAction: CardAction, includesOAuthButtons?: boolean) {
  const { type } = cardAction;
  let action;

  if (
    type === 'imBack' ||
    type === 'messageBack' ||
    type === 'postBack' ||
    (type === 'signin' && includesOAuthButtons)
  ) {
    action = new SubmitAction();

    action.data = {
      __isBotFrameworkCardAction: true,
      cardAction
    };

    action.title = cardAction.title;
  } else {
    action = new OpenUrlAction();

    action.title = cardAction.title;
    action.url = cardAction.type === 'call' ? `tel:${cardAction.value}` : cardAction.value;
  }

  return action;
}

export default class AdaptiveCardBuilder {
  card: AdaptiveCard;
  container: Container;
  styleOptions: any;

  constructor(adaptiveCards, styleOptions) {
    this.card = new adaptiveCards.AdaptiveCard();
    this.container = new Container();
    this.styleOptions = styleOptions;

    this.card.addItem(this.container);
  }

  addColumnSet(sizes: number[], container: Container = this.container) {
    const columnSet = new ColumnSet();

    container.addItem(columnSet);

    return sizes.map(size => {
      const column = new Column();

      column.width = SizeAndUnit.parse(size);

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
        textblock[prop] = template[prop];
      }

      textblock.text = text;

      container.addItem(textblock);
    }
  }

  addButtons(cardActions: CardAction[], includesOAuthButtons?: boolean) {
    cardActions &&
      cardActions.forEach(cardAction => {
        this.card.addAction(addCardAction(cardAction, includesOAuthButtons));
      });
  }

  addCommonHeaders(content: ICommonContent) {
    const { richCardWrapTitle } = this.styleOptions;
    this.addTextBlock(content.title, {
      color: TextColor.Dark,
      size: TextSize.Medium,
      weight: TextWeight.Bolder,
      wrap: richCardWrapTitle
    });
    this.addTextBlock(content.subtitle, { color: TextColor.Dark, isSubtle: true, wrap: richCardWrapTitle });
    this.addTextBlock(content.text, { color: TextColor.Dark, wrap: true });
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
