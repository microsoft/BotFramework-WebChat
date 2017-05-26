import { CardAction, HeroCard } from 'botframework-directlinejs';
import * as AdaptiveCardSchema from "microsoft-adaptivecards/built/schema";
import { BotFrameworkCardAction } from './AdaptiveCardContainer';

interface IVersionedCard extends AdaptiveCardSchema.ICard {
    version: string;
}

class AdaptiveCardBuilder {
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

    addItems(elements: AdaptiveCardSchema.ICardElement[]) {
        this.container.items.push.apply(this.container.items, elements);
    }

    addTextBlock(text: string, template: Partial<AdaptiveCardSchema.ITextBlock>) {
        if (typeof text !== undefined) {
            var textblock: AdaptiveCardSchema.ITextBlock = {
                type: "TextBlock",
                text: text,
                ...template
            };
            this.container.items.push(textblock);
        }
    }

    addButtons(buttons: CardAction[]) {
        if (buttons) {
            this.card.actions = buttons.map((button): AdaptiveCardSchema.ActionSubmit => {
                const cardAction: BotFrameworkCardAction = { __isBotFrameworkCardAction: true, ...button };
                return {
                    title: button.title,
                    type: "Action.Submit",
                    data: cardAction
                };
            });
        }
    }
}

export const AdaptiveHero = (attachment: HeroCard) => {
    const content = attachment.content;
    if (!content) return null;

    const cardBuilder = new AdaptiveCardBuilder();

    //add images to top of hero card
    if (content.images) {
        cardBuilder.addItems(content.images.map((image): AdaptiveCardSchema.IImage => {
            return {
                type: "Image",
                url: image.url,
                size: "stretch"
            }
        }));
    }

    cardBuilder.addTextBlock(content.title, { size: "medium", weight: "bolder" });
    cardBuilder.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
    cardBuilder.addTextBlock(content.text, { wrap: true });
    cardBuilder.addButtons(content.buttons);

    return cardBuilder.card;
}