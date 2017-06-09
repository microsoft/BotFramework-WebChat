import * as React from 'react';
import * as AdaptiveCards from "microsoft-adaptivecards";
import * as AdaptiveCardSchema from "microsoft-adaptivecards/built/schema";
import { CardAction } from "botframework-directlinejs/built/directLine";
import { classList, IDoCardAction, konsole } from "./Chat";
import { AjaxResponse, AjaxRequest } from 'rxjs/observable/dom/AjaxObservable';
import * as adaptivecardsHostConfig from '../adaptivecards-hostconfig.json';

export interface Props {
    card: AdaptiveCardSchema.ICard,
    onImageLoad?: () => any,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void,
    onCardAction: IDoCardAction,
    className?: string
}

class LinkedAdaptiveCard extends AdaptiveCards.AdaptiveCard {
    constructor(public adaptiveCardContainer: AdaptiveCardContainer) {
        super();
    }
}

export interface BotFrameworkCardAction extends CardAction {
    __isBotFrameworkCardAction: boolean
}

function getLinkedAdaptiveCard(action: AdaptiveCards.Action) {
    let element = action.parent;
    while (element && !(element instanceof LinkedAdaptiveCard)) {
        element = element.parent;
    }
    return element as LinkedAdaptiveCard;
}

function cardWithoutHttpActions(card: AdaptiveCardSchema.ICard) {
    if (!card.actions) return card;

    const actions: AdaptiveCardSchema.IActionBase[] = [];

    card.actions.forEach(action => {

        //filter out http action buttons
        if (action.type === 'Action.Http') return;

        if (action.type === 'Action.ShowCard') {
            const showCardAction = action as AdaptiveCardSchema.IActionShowCard;
            showCardAction.card = cardWithoutHttpActions(showCardAction.card);
        }

        actions.push(action);
    });

    return { ...card, actions };
}

AdaptiveCards.AdaptiveCard.onExecuteAction = (action: AdaptiveCards.ExternalAction) => {

    if (action instanceof AdaptiveCards.OpenUrlAction) {
        window.open(action.url);

    } else if (action instanceof AdaptiveCards.SubmitAction) {
        const linkedAdaptiveCard = getLinkedAdaptiveCard(action);
        if (linkedAdaptiveCard && action.data) {
            if (typeof action.data === 'object' && (action.data as BotFrameworkCardAction).__isBotFrameworkCardAction) {
                const cardAction = (action.data as BotFrameworkCardAction);
                linkedAdaptiveCard.adaptiveCardContainer.onCardAction(cardAction.type, cardAction.value);
            } else {
                linkedAdaptiveCard.adaptiveCardContainer.onCardAction('postBack', action.data);
            }
        }
    }
};

export class AdaptiveCardContainer extends React.Component<Props, {}> {
    private div: HTMLDivElement;

    constructor(props: Props) {
        super(props);
    }

    public onCardAction: IDoCardAction = (type, value) => {
        this.props.onCardAction(type, value);
    }

    private onClick(e: React.MouseEvent<HTMLElement>) {
        if (!this.props.onClick) return;

        //do not allow form elements to trigger a parent click event
        switch ((e.target as HTMLElement).tagName) {
            case 'AUDIO':
            case 'VIDEO':
            case 'BUTTON':
            case 'INPUT':
            case 'LABEL':
            case 'TEXTAREA':
            case 'SELECT':
                break;
            default:
                this.props.onClick(e);
        }
    }

    componentDidMount() {

        const adaptiveCard = new LinkedAdaptiveCard(this);
        adaptiveCard.parse(cardWithoutHttpActions(this.props.card));
        const errors = adaptiveCard.validate();

        if (errors.length === 0) {

            let renderedCard: HTMLElement;
            try {
                renderedCard = adaptiveCard.render();
            }
            catch (e) {
                const ve: AdaptiveCards.IValidationError = {
                    error: -1,
                    message: e
                };
                errors.push(ve);

                if (e.stack) {
                    konsole.log(e.stack);
                }
            }

            if (renderedCard) {
                if (this.props.onImageLoad) {
                    var imgs = renderedCard.querySelectorAll('img');
                    if (imgs && imgs.length > 0) {
                        Array.prototype.forEach.call(imgs, (img: HTMLImageElement) => {
                            img.addEventListener('load', this.props.onImageLoad);
                        });
                    }
                }

                this.div.appendChild(renderedCard);
                return;
            }
        }

        //render errors
        errors.forEach(e => {
            var div = document.createElement('div');
            div.innerText = e.message;
            this.div.appendChild(div);
        });
    }

    render() {
        const wrappedChildren = this.props.children ? <div className="non-adaptive-content">{this.props.children}</div> : null;
        return (
            <div className={classList('wc-card', 'wc-adaptive-card', this.props.className)} ref={div => this.div = div} onClick={e => this.onClick(e)}>
                {wrappedChildren}
            </div>
        )
    }
}

AdaptiveCards.setHostConfig(adaptivecardsHostConfig);
