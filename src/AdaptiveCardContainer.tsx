import * as React from 'react';
import { Action, AdaptiveCard, HostConfig, IValidationError, OpenUrlAction, SubmitAction } from "adaptivecards";
import { IActionBase, IActionShowCard, IAdaptiveCard } from "adaptivecards/lib/schema";
import { CardAction } from "botframework-directlinejs/built/directLine";
import { classList, IDoCardAction } from "./Chat";
import { AjaxResponse, AjaxRequest } from 'rxjs/observable/dom/AjaxObservable';
import * as adaptivecardsHostConfig from '../adaptivecards-hostconfig.json';
import * as konsole from './Konsole';

export interface Props {
    card?: AdaptiveCard,
    jcard?: IAdaptiveCard,
    onImageLoad?: () => any,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void,
    onCardAction: IDoCardAction,
    className?: string
}

export interface State {
    errors?: string[]
}

export interface BotFrameworkCardAction extends CardAction {
    __isBotFrameworkCardAction: boolean
}

const hostConfig = new HostConfig(adaptivecardsHostConfig);

function cardWithoutHttpActions(card: IAdaptiveCard) {
    if (!card.actions) return card;
    const actions: IActionBase[] = [];
    card.actions.forEach(action => {
        //filter out http action buttons
        if (action.type === 'Action.Http') return;
        if (action.type === 'Action.ShowCard') {
            const showCardAction = action as IActionShowCard;
            showCardAction.card = cardWithoutHttpActions(showCardAction.card);
        }
        actions.push(action);
    });
    return { ...card, actions };
}

export class AdaptiveCardContainer extends React.Component<Props, State> {
    private div: HTMLDivElement;

    constructor(props: Props) {
        super(props);
    }

    private onClick(e: React.MouseEvent<HTMLElement>) {
        if (!this.props.onClick) return;
        //do not allow form elements to trigger a parent click event
        switch ((e.target as HTMLElement).tagName) {
            case 'A':
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

    private onExecuteAction(action: Action) {
        if (action instanceof OpenUrlAction) {
            window.open(action.url);
        } else if (action instanceof SubmitAction) {
            if (action.data !== undefined) {
                if (typeof action.data === 'object' && (action.data as BotFrameworkCardAction).__isBotFrameworkCardAction) {
                    const cardAction = (action.data as BotFrameworkCardAction);
                    this.props.onCardAction(cardAction.type, cardAction.value);
                } else {
                    this.props.onCardAction(typeof action.data === 'string' ? 'imBack' : 'postBack', action.data);
                }
            }
        }
    }
    componentDidMount() {
        const adaptiveCard = this.props.card || new AdaptiveCard();
        adaptiveCard.hostConfig = hostConfig;
        let errors: IValidationError[] = [];
        if (!this.props.card && this.props.jcard) {
            adaptiveCard.parse(cardWithoutHttpActions(this.props.jcard));
            errors = adaptiveCard.validate();
        }
        adaptiveCard.onExecuteAction = (action) => this.onExecuteAction(action);
        if (errors.length === 0) {
            let renderedCard: HTMLElement;
            try {
                renderedCard = adaptiveCard.render();
            }
            catch (e) {
                const ve: IValidationError = {
                    error: -1,
                    message: e
                };
                errors.push(ve);
                if (e.stack) {
                    ve.message += '\n' + e.stack;
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
        if (errors.length > 0) {
            console.log('Error(s) rendering AdaptiveCard:');
            errors.forEach(e => console.log(e.message));
            this.setState({ errors: errors.map(e => e.message) });
        }
    }

    render() {
        let wrappedChildren: JSX.Element;
        const hasErrors = this.state && this.state.errors && this.state.errors.length > 0;
        if (hasErrors) {
            wrappedChildren = (
                <div>
                    <svg className="error-icon" viewBox="0 0 15 12.01">
                        <path d="M7.62 8.63v-.38H.94a.18.18 0 0 1-.19-.19V.94A.18.18 0 0 1 .94.75h10.12a.18.18 0 0 1 .19.19v3.73H12V.94a.91.91 0 0 0-.07-.36 1 1 0 0 0-.5-.5.91.91 0 0 0-.37-.08H.94a.91.91 0 0 0-.37.07 1 1 0 0 0-.5.5.91.91 0 0 0-.07.37v7.12a.91.91 0 0 0 .07.36 1 1 0 0 0 .5.5.91.91 0 0 0 .37.08h6.72c-.01-.12-.04-.24-.04-.37z M11.62 5.26a3.27 3.27 0 0 1 1.31.27 3.39 3.39 0 0 1 1.8 1.8 3.36 3.36 0 0 1 0 2.63 3.39 3.39 0 0 1-1.8 1.8 3.36 3.36 0 0 1-2.62 0 3.39 3.39 0 0 1-1.8-1.8 3.36 3.36 0 0 1 0-2.63 3.39 3.39 0 0 1 1.8-1.8 3.27 3.27 0 0 1 1.31-.27zm0 6a2.53 2.53 0 0 0 1-.21A2.65 2.65 0 0 0 14 9.65a2.62 2.62 0 0 0 0-2 2.65 2.65 0 0 0-1.39-1.39 2.62 2.62 0 0 0-2 0A2.65 2.65 0 0 0 9.2 7.61a2.62 2.62 0 0 0 0 2A2.65 2.65 0 0 0 10.6 11a2.53 2.53 0 0 0 1.02.26zM13 7.77l-.86.86.86.86-.53.53-.86-.86-.86.86-.53-.53.86-.86-.86-.86.53-.53.86.86.86-.86zM1.88 7.13h2.25V4.88H1.88zm.75-1.5h.75v.75h-.75zM5.63 2.63h4.5v.75h-4.5zM1.88 4.13h2.25V1.88H1.88zm.75-1.5h.75v.75h-.75zM9 5.63H5.63v.75h2.64A4 4 0 0 1 9 5.63z" />
                    </svg>
                    <div className="error-text">Can't render card</div>
                </div>
            );
        } else if (this.props.children) {
            wrappedChildren = (
                <div className="non-adaptive-content">
                    {this.props.children}
                </div>
            );
        } else {
            wrappedChildren = null;
        }
        return (
            <div className={classList('wc-card', 'wc-adaptive-card', this.props.className, hasErrors && 'error')} ref={div => this.div = div} onClick={e => this.onClick(e)}>
                {wrappedChildren}
            </div>
        )
    }

    componentDidUpdate() {
        if (this.props.onImageLoad) this.props.onImageLoad();
    }
}
