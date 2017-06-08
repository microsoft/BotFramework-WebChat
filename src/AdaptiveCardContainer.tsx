import * as React from 'react';
import * as AdaptiveCards from "microsoft-adaptivecards";
import { CardAction } from "botframework-directlinejs/built/directLine";
import { classList, IDoCardAction, konsole } from "./Chat";
import { AjaxResponse, AjaxRequest } from 'rxjs/observable/dom/AjaxObservable';
import { Observable } from 'rxjs/Observable';

export interface Props {
    card: any,
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

        //lazy-config the first time through
        if (!adaptiveCardsConfiguration.configured) {
            adaptiveCardsConfiguration.configFromJsonInCss();
        }

        const adaptiveCard = new LinkedAdaptiveCard(this);
        adaptiveCard.parse(this.props.card);
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

    componentWillUnmount() {
    }

    render() {
        return (
            <div className={classList('wc-card', 'wc-adaptive-card', this.props.className)} ref={div => this.div = div} onClick={e => this.onClick(e)}>
                {this.props.children}
            </div>
        )
    }
}

class AdaptiveCardsConfiguration {

    public configured = false;

    private getJsonEmbeddedInCssContent(cssId: string) {
        const element = document.createElement('a');  //any element tagname will work
        element.id = cssId;
        element.style.display = 'none';
        document.body.appendChild(element);
        const style = window.getComputedStyle(element);
        const content = style.content;
        document.body.removeChild(element);
        return content.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    public configFromJsonInCss() {
        const json = this.getJsonEmbeddedInCssContent('ac-hostConfig');
        if (!json) {
            konsole.log('Did not find AdaptiveCards HostConfig JSON in CSS: #ac-hostConfig {content: <JSON> }');
            return;
        }

        let hostConfig: AdaptiveCards.IHostConfig;

        try {
            hostConfig = JSON.parse(json);
        } catch (e) {
            konsole.log('Could not parse AdaptiveCards HostConfig as JSON in CSS: #ac-hostConfig {content: <JSON> }');
        }

        if (!hostConfig || typeof hostConfig !== 'object') {
            konsole.log('AdaptiveCards HostConfig JSON is not an object.');
            return;
        }

        AdaptiveCards.setHostConfig(hostConfig);

        this.configured = true;
    };

}

const adaptiveCardsConfiguration = new AdaptiveCardsConfiguration();
