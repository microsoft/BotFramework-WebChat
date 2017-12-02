import { Attachment, CardAction, HeroCard, Thumbnail } from 'botframework-directlinejs';
import { AdaptiveCard, CardElement, Column, ColumnSet, Container, Image, Size, SubmitAction, TextBlock, TextSize, TextWeight } from "adaptivecards";
import { BotFrameworkCardAction } from './AdaptiveCardContainer';

// interface IVersionedCard extends AdaptiveCardSchema.IAdaptiveCard {
//     version: string;
// }

export class AdaptiveCardBuilder {
    private container: Container;
    public card: AdaptiveCard;

    constructor() {
        this.card = new AdaptiveCard();

        this.container = new Container();
        this.card.addItem(this.container);
    }

    addColumnSet(sizes: number[], container?: Container) {
        container = container || this.container;
        const columnSet = new ColumnSet();
        container.addItem(columnSet);
        const columns = sizes.map(size => {
            const column = new Column();
            column.width = size;
            columnSet.addColumn(column);
            return column;
        })
        return columns;
    }

    addItems(cardElements: CardElement[], container?: Container) {
        container = container || this.container;
        cardElements.forEach(cardElement => container.addItem(cardElement));
    }

    addTextBlock(text: string, template: Partial<TextBlock>, container?: Container) {
        container = container || this.container;
        if (typeof text !== 'undefined') {
            const textblock = new TextBlock();
            for (let prop in template) {
                (textblock as any)[prop] = (template as any)[prop];
            }
            textblock.text = text;
            container.addItem(textblock);
        }
    }

    addButtons(cardActions: CardAction[]) {
        if (cardActions) {
            cardActions.forEach(cardAction => {
                const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };
                const action = new SubmitAction();
                action.title = cardAction.title;
                action.data = botFrameworkCardAction;
                this.card.addAction(action);
            });
        }
    }

    addCommon(content: ICommonContent) {
        this.addTextBlock(content.title, { size: TextSize.Medium, weight: TextWeight.Bolder });
        this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
        this.addTextBlock(content.text, { wrap: true });
        this.addButtons(content.buttons);
    }

    addImage(url: string, container?: Container) {
        container = container || this.container;
        var image = new Image();
        image.url = url;
        image.size = Size.Stretch;
        container.addItem(image);
    }

}

export interface ICommonContent {
    title?: string,
    subtitle?: string,
    text?: string,
    buttons?: CardAction[]
}

export const buildCommonCard = (content: ICommonContent): AdaptiveCard => {
    if (!content) return null;

    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommon(content)
    return cardBuilder.card;
};
