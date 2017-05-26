import * as React from 'react';
import * as AdaptiveCards from "microsoft-adaptivecards";
import { CardAction } from "botframework-directlinejs/built/directLine";
import { IDoCardAction, konsole } from "./Chat";
import { AjaxResponse, AjaxRequest } from 'rxjs/observable/dom/AjaxObservable';
import { Observable } from 'rxjs/Observable';

export interface Props {
    content: any,
    onImageLoad: () => any,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void,
    onCardAction: IDoCardAction
}

class LinkedAdaptiveCard extends AdaptiveCards.AdaptiveCard {
    constructor(public adaptiveCardContainer: AdaptiveCardContainer){
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

    } else if (action instanceof AdaptiveCards.HttpAction) {
        /**
         * This is a simple implementation of AdaptiveCards.HttpAction, but bot developers
         * should be encouraged to use AdaptiveCards.SubmitAction instead to keep their bot in context
         * and so that there does not need to be an additional auth mechanism for the http connection.
         */

        Observable.ajax({
            body: action.body,
            crossDomain: true,
            headers: action.headers,
            method: action.method,
            url: action.url
        } as AjaxRequest)
            .subscribe(response => {
                konsole.log("success sending HttpAction");
            }, error => {
                konsole.log("failed to send HttpAction", error);
            });
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
        var adaptiveCard = new LinkedAdaptiveCard(this);
        adaptiveCard.parse(this.props.content);
        const renderedCard = adaptiveCard.render();

        var imgs = renderedCard.querySelectorAll('img');
        if (imgs && imgs.length > 0) {
            Array.prototype.forEach.call(imgs, (img: HTMLImageElement) => {
                img.addEventListener('load', this.props.onImageLoad);
            });
        }

        this.div.appendChild(renderedCard);
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className="wc-card wc-adaptive-card" ref={div => this.div = div} onClick={ e => this.onClick(e) } />
        )
    }
}
