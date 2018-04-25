import { Attachment, CardAction, HeroCard, Thumbnail, CardImage } from 'botframework-directlinejs';
import * as AdaptiveCardSchema from "microsoft-adaptivecards/built/schema";
import { BotFrameworkCardAction } from './AdaptiveCardContainer';

interface IVersionedCard extends AdaptiveCardSchema.ICard {
    version: string;
}

export class AdaptiveCardBuilder {
    public container: AdaptiveCardSchema.IContainer;
    public card: AdaptiveCardSchema.ICard;

    constructor() {
        this.container = {
            type: "Container",
            items: []
        };

        this.card = {
            type: "AdaptiveCard",
            version: "0.5",
            body: [this.container]
        } as IVersionedCard;
    }

    addColumnSet(sizes: number[], container = this.container) {
        const columnSet: AdaptiveCardSchema.IColumnSet = {
            type: 'ColumnSet',
            columns: sizes.map((size): AdaptiveCardSchema.IColumn => {
                return {
                    type: 'Column',
                    size: size.toString(),
                    items: []
                }
            })
        };
        container.items.push(columnSet);
        return columnSet.columns;
    }

    addItems(elements: AdaptiveCardSchema.ICardElement[], container = this.container) {
        container.items.push.apply(container.items, elements);
    }

    addTextBlock(text: string, template: Partial<AdaptiveCardSchema.ITextBlock>, container = this.container) {
        if (typeof text !== 'undefined') {
            const textblock: AdaptiveCardSchema.ITextBlock = {
                type: "TextBlock",
                text: text,
                ...template
            };
            container.items.push(textblock);
        }
    }

    addButtons(buttons: CardAction[], includesOAuthButtons?: boolean) {
        if (buttons) {
            this.card.actions = buttons.map(b => AdaptiveCardBuilder.addCardAction(b, includesOAuthButtons));
        }
    }

    private static addCardAction(cardAction: CardAction, includesOAuthButtons?: boolean) {
        if (cardAction.type === 'imBack' || cardAction.type === 'postBack') {
            const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };
            return {
                title: cardAction.title,
                type: "Action.Submit",
                data: botFrameworkCardAction
            };
        }
        else if (cardAction.type === 'signin' && includesOAuthButtons) {
            // Create a button specific for OAuthCard 'signin' actions (cardAction.type == signin and button action is Action.Submit)
            const botFrameworkCardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...cardAction };
            return {
                type: 'Action.Submit',
                title: cardAction.title,
                data: botFrameworkCardAction
            };
        }
        else {
            return {
                type: 'Action.OpenUrl',
                title: cardAction.title,
                url: cardAction.type === 'call' ? 'tel:' + cardAction.value : cardAction.value
            };
        }
    }

    addCommonHeaders(content: ICommonContent) {
        this.addTextBlock(content.title, { size: "medium", weight: "bolder" });
        this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true, separation: "none" } as any); //TODO remove "as any" because separation is not defined
        this.addTextBlock(content.text, { wrap: true });
    }

    addCommon(content: ICommonContent) {
        this.addCommonHeaders(content);
        this.addButtons(content.buttons);
    }

    addImage(image: CardImage, container = this.container) {
        var img: AdaptiveCardSchema.IImage = {
            type: "Image",
            url: image.url,
            size: "stretch",
        };

        if (image.tap) {
            img.selectAction = AdaptiveCardBuilder.addCardAction(image.tap);
        }
        container.items.push(img);
    }

}

export interface ICommonContent {
    title?: string,
    subtitle?: string,
    text?: string,
    buttons?: CardAction[]
}

export const buildCommonCard = (content: ICommonContent): AdaptiveCardSchema.ICard => {
    if (!content) return null;

    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommon(content)
    return cardBuilder.card;
};

export const buildOAuthCard = (content: ICommonContent): AdaptiveCardSchema.ICard => {
    if (!content) return null;

    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommonHeaders(content);
    cardBuilder.addButtons(content.buttons, true);
    return cardBuilder.card;
};
