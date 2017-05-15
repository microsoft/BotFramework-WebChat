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

var adaptiveConfig: AdaptiveCards.IHostConfig = {
    supportsInteractivity: true,
    strongSeparation: {
        spacing: 40,
        lineThickness: 1,
        lineColor: "#EEEEEE"
    },
    fontFamily: "'Segoe UI', sans serif",
    fontSizes: {
        small: 12,
        normal: 13,
        medium: 13,
        large: 14,
        extraLarge: 15
    },
    fontWeights: {
        lighter: 200,
        normal: 400,
        bolder: 700
    },
    colors: {
        dark: {
            normal: "#333333",
            subtle: "#EE333333"
        },
        light: {
            normal: "#FFFFFF",
            subtle: "#88FFFFFF"
        },
        accent: {
            normal: "#2E89FC",
            subtle: "#882E89FC"
        },
        attention: {
            normal: "#FFD800",
            subtle: "#DDFFD800"
        },
        good: {
            normal: "#00FF00",
            subtle: "#DD00FF00"
        },
        warning: {
            normal: "#FF0000",
            subtle: "#DDFF0000"
        }
    },
    imageSizes: {
        small: 40,
        medium: 80,
        large: 160
    },
    actions: {
        maxActions: 5,
        separation: {
            spacing: 8
        },
        buttonSpacing: 8,
        showCard: {
            actionMode: "inlineEdgeToEdge",
            inlineTopMargin: 16,
            backgroundColor: "#08000000",
            padding: {
                top: 8,
                right: 8,
                bottom: 8,
                left: 8
            }
        },
        actionsOrientation: "vertical",
        actionAlignment: "center"
    },
    adaptiveCard: {
        backgroundColor: "#FFFFFF",
        padding: {
            left: 8,
            top: 8,
            right: 8,
            bottom: 8
        }
    },
    container: {
        separation: {
            spacing: 8
        },
        normal: {
        },
        emphasis: {
            backgroundColor: "#EEEEEE",
            borderColor: "#AAAAAA",
            borderThickness: {
                top: 1,
                right: 1,
                bottom: 1,
                left: 1
            },
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        }
    },
    textBlock: {
        color: "dark",
        separations: {
            small: {
                spacing: 8,
            },
            normal: {
                spacing: 8
            },
            medium: {
                spacing: 8
            },
            large: {
                spacing: 8
            },
            extraLarge: {
                spacing: 8
            }
        }
    },
    image: {
        size: "medium",
        separation: {
            spacing: 8
        }
    },
    imageSet: {
        imageSize: "medium",
        separation: {
            spacing: 8
        }
    },
    factSet: {
        separation: {
            spacing: 8
        },
        title: {
            color: "dark",
            size: "normal",
            isSubtle: false,
            weight: "bolder",
            wrap: true,
            maxWidth: 150
        },
        value: {
            color: "dark",
            size: "normal",
            isSubtle: false,
            weight: "normal",
            wrap: true
        },
        spacing: 10
    },
    input: {
        separation: {
            spacing: 8
        }
    },
    columnSet: {
        separation: {
            spacing: 8
        }
    },
    column: {
        separation: {
            spacing: 8
        }
    }
};

AdaptiveCards.setHostConfig(adaptiveConfig);
