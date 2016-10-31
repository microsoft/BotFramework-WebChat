import * as React from 'react';
import { Attachment, Button } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';


export const AttachmentView = (props: {
    store: ChatStore,
    attachment: Attachment,
    onImageLoad?: ()=> void
}) => {
    const state = props.store.getState();

    const onClickButton = (type: string, value: string) => {
        switch (type) {
            case "imBack":
            case "postBack":
                state.connection.botConnection.postMessage(value, state.connection.user)
                .retry(2)
                .subscribe(
                    () => {
                        if (type === "imBack") {
                            props.store.dispatch({ type: 'Send_Message', activity: {
                                type: "message",
                                text: value,
                                from: { id: state.connection.user.id },
                                timestamp: Date.now().toString()
                            }} as HistoryAction);
                        } else {
                            console.log("quietly posted message", value);
                        }
                    },
                    error => {
                        console.log("failed to post message");
                    }
                );
                break;

            case "openUrl":
            case "signin":
                window.open(value);
                break;

            default:
                console.log("unknown button type");
            }
    }

    const buttons = (buttons?: Button[]) => buttons &&
        <ul className="wc-card-buttons">
            { buttons.map(button => <li><button onClick={ () => onClickButton(button.type, button.value) }>{ button.title }</button></li>) }
        </ul>;

    const imageWithOnLoad = (url: string) =>
        <img src={ url } onLoad={ () => props.onImageLoad() } />;

    const attachedImage = (images?: { url: string }[]) =>
        images && imageWithOnLoad(images[0].url);

    switch (props.attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (
                <div className='wc-card hero'>
                    { attachedImage(props.attachment.content.images) }
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
                        { attachedImage(props.attachment.content.images) }
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
                                <th colSpan={ 2 }>{ props.attachment.content.title }</th>
                            </tr>
                            { props.attachment.content.facts && props.attachment.content.facts.map(fact => <tr><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ props.attachment.content.items && props.attachment.content.items.map(item =>
                            <tr>
                                <td>{ item.image && imageWithOnLoad(item.image.url) } /> }<span>{ item.title }</span></td>
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
        case "image/gif":
            return imageWithOnLoad(props.attachment.contentUrl);

        default:
            return <span/>;

    }
}