import { Attachment, CardAction, HeroCard, Thumbnail, CardImage } from 'botframework-directlinejs';
import { AdaptiveCard, CardElement, Column, ColumnSet, ColumnWidth, Container, Image, OpenUrlAction, Size, SizeUnit, SubmitAction, TextBlock, TextSize, TextWeight } from 'adaptivecards';
import { BotFrameworkCardAction } from './AdaptiveCardContainer';
import { SizeAndUnit } from 'adaptivecards/lib/utils';
import { Tile } from './Types';

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
            column.width = new SizeAndUnit(size, SizeUnit.Pixel);
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


    addButtons(cardActions: CardAction[], includesOAuthButtons?: boolean, tiles?: Tile[]) {
        if (cardActions) {
            if(tiles) {
            cardActions.map((cardAction, index) => {
                this.card.addAction(AdaptiveCardBuilder.addCardAction(cardAction, includesOAuthButtons, tiles[index]));
            })
        }else{
            cardActions.forEach(cardAction => {
                this.card.addAction(AdaptiveCardBuilder.addCardAction(cardAction, includesOAuthButtons));
            });
        }
        }
    }

    private static addCardAction(cardAction: CardAction, includesOAuthButtons?: boolean, tile?: Tile) {
        if (cardAction.type === 'imBack' || cardAction.type === 'postBack') {
            const action = new SubmitAction();
            const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };

            action.data = botFrameworkCardAction;
            action.title = cardAction.title;
            if(tile){
                action.iconUrl = tile.image
            }

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
            const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };

            action.title = cardAction.title;
            action.url = cardAction.type === 'call' ? 'tel:' + cardAction.value : cardAction.value;

            return action;
        }
    }

    addCommonHeaders(content: ICommonContent) {
        this.addTextBlock(content.title, { size: TextSize.Medium, weight: TextWeight.Bolder });
        this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
        this.addTextBlock(content.text, { wrap: true });
    }

    addCommon(content: ICommonContent, tiles?: Tile[]) {
        this.addCommonHeaders(content);
        this.addButtons(content.buttons, false, tiles);
    }

    addImage(url: string, container?: Container, selectAction?: CardAction) {
        container = container || this.container;

        const image = new Image();

        image.url = url;
        image.size = Size.Stretch;

        if (selectAction) {
            image.selectAction = AdaptiveCardBuilder.addCardAction(selectAction);
        }

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

export const buildOAuthCard = (content: ICommonContent): AdaptiveCard => {
    if (!content) return null;

    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommonHeaders(content);
    cardBuilder.addButtons(content.buttons, true);
    return cardBuilder.card;
};
