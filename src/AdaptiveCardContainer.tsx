import * as React from 'react';
import * as AdaptiveCards from "microsoft-adaptivecards";
import { CardAction } from "botframework-directlinejs/built/directLine";
import { IDoCardAction, konsole } from "./Chat";
import { AjaxResponse, AjaxRequest } from 'rxjs/observable/dom/AjaxObservable';
import { Observable } from 'rxjs/Observable';

export interface Props {
    content: any,
    onImageLoad: () => any,
    onCardAction: IDoCardAction
}

class LinkedAdaptiveCard extends AdaptiveCards.AdaptiveCard {
    constructor(public adaptiveCardContainer: AdaptiveCardContainer){
        super();
    }
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
        if (linkedAdaptiveCard) {
            linkedAdaptiveCard.adaptiveCardContainer.onCardAction('postBack', action.data);
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
            <div className="wc-card wc-adaptive-card" ref={div => this.div = div} />
        )
    }
}
