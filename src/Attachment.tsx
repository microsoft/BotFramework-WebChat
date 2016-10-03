import * as React from 'react';
import { Attachment, Button } from './directLineTypes';
import { HistoryActions } from './BotChat';

export const AttachmentView = (props: {
    actions: HistoryActions,
    attachment: Attachment
}) => {
    const buttonActions = {
        "imBack": props.actions.buttonImBack,
        "openUrl": props.actions.buttonOpenUrl,
        "postBack": props.actions.buttonPostBack,
        "signin": props.actions.buttonSignIn
    }
    // REVIEW we need to make sure each button.type is one of these

    const buttons = (buttons?: Button[]) => buttons &&
        <ul className="wc-card-buttons">
            { buttons.map(button => <li><button onClick={ () => buttonActions[button.type](button.value) }>{ button.title }</button></li>) }
        </ul>;
    
    const images = (images?: { url: string }[]) => images &&
        <div> 
            { images.map(image => <img src={ image.url } />) }
        </div>;

    switch (props.attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (
                <div className='wc-card hero'>
                    { images(props.attachment.content.images) }
                    <h1>{ props.attachment.content.title }</h1>
                    <h2>{ props.attachment.content.subtitle }</h2>
                    <p>{ props.attachment.content.text }</p>
                    { buttons(props.attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            return (
                <div className='wc-card thumbnail'>
                    <h1>{ props.attachment.content.title }</h1>
                    <p>
                        { images(props.attachment.content.images) }
                        <h2>{ props.attachment.content.subtitle }</h2>
                        { props.attachment.content.text }
                    </p>
                    { buttons(props.attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            return (
                <div className='wc-card signin'>
                    <h1>{ props.attachment.content.text }</h1>
                    { buttons(props.attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.receipt":
            return (
                <div className='wc-card receipt'>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan="2">{ props.attachment.content.title }</th>
                            </tr>
                            { props.attachment.content.facts && props.attachment.content.facts.map(fact => <tr><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ props.attachment.content.items && props.attachment.content.items.map(item =>
                            <tr>
                                <td>{ item.image && <img src={ item.image.url }/> }<span>{ item.title }</span></td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Tax</td>
                                <td>{ props.attachment.content.tax }</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{ props.attachment.content.total }</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
            return <img src={ props.attachment.contentUrl }/>;
        
        default:
            return <span/>;

    }
}