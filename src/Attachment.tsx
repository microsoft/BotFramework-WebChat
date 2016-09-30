import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App';

export interface IAttachment {
    content: any;
    contentType: string;
    contentUrl: string;
}

export const Attachment = (props: {
    actions: HistoryActions,
    attachment: IAttachment
}) => {
    const buttonActions = {
        "imBack": props.actions.buttonImBack,
        "openUrl": props.actions.buttonOpenUrl,
        "postBack": props.actions.buttonPostBack
    }
    // REVIEW we need to make sure each button.type is one of these

    const content = props.attachment.content;
    const cardPrefix = 'application/vnd.microsoft.card.';

    if (props.attachment.contentType && props.attachment.contentType.indexOf(cardPrefix) == 0) {

        const buttonList = () => {
            return (
                <ul className="wc-card-buttons">
                    { content.buttons.map(button => <li><button onClick={ () => buttonActions[button.type](button.value) }>{ button.title }</button></li>) }
                </ul>
            );
        };

        const cardType = props.attachment.contentType.substring(cardPrefix.length);
        const className = 'wc-card ' + cardType;

        switch (cardType) {

            case 'hero':
                return (
                    <div className={className}>
                        <img src={ content.images[0].url } />
                        <h1>{ content.title }</h1>
                        <h2>{ content.subtitle }</h2>
                        <p>{ content.text }</p>
                        {buttonList() }
                    </div>
                );

            case 'thumbnail':
                return (
                    <div className={className}>
                        <h1>{ content.title }</h1>
                        <p>
                            <img src={ content.images[0].url } />
                            <h2>{ content.subtitle }</h2>
                            { content.text }
                        </p>
                        {buttonList() }
                    </div>
                );

            case 'signin':
                return (
                    <div className={className}>
                        <h1>{ content.text }</h1>
                        {buttonList() }
                    </div>
                );

            case 'receipt':

                const itemImage = (item) => {
                    if (item.image) {
                        return <img src={ item.image.url }/>
                    }
                };

                return (
                    <div className={className}>
                        <table>
                            <thead>
                                <tr>
                                    <th colSpan="2">{ content.title }</th>
                                </tr>
                                { content.facts.map(fact => <tr><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                            </thead>
                            <tbody>
                                { content.items.map(item => <tr><td>{ itemImage(item) }<span>{ item.title }</span></td><td>{ item.price }</td></tr>) }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>Tax</td>
                                    <td>{ content.tax }</td>
                                </tr>
                                <tr>
                                    <td>Total</td>
                                    <td>{ content.total }</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                );
        }
    } else {
        switch (props.attachment.contentType) {
            case "image/png":
                return <img src={ props.attachment.contentUrl }/>;
        }
    }
}