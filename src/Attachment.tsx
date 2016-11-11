import * as React from 'react';
import { Attachment, Button } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { sendMessage, sendPostBack } from './Chat';

const nonEmpty = (value: string, template: JSX.Element): JSX.Element => {
    if (typeof value === 'string' && value.length > 0) return template;
}

export const AttachmentView = (props: {
    store: ChatStore,
    attachment: Attachment,
    onImageLoad?: ()=> void
}) => {
    if (!props.attachment) return;

    const attachment = props.attachment;
    
    const state = props.store.getState();

    const onClickButton = (type: string, value: string) => {
        switch (type) {
            case "imBack":
                sendMessage(props.store, value);
                break;
            case "postBack":
                sendPostBack(props.store, value);
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

    const audio = (audioUrl: string, autoPlay?:boolean, loop?: boolean) =>
        <audio src={ audioUrl } autoPlay={ autoPlay } controls loop={ loop } />;

    const videoWithOnLoad = (videoUrl: string, thumbnailUrl?: string, autoPlay?:boolean, loop?: boolean) =>
        <video src={ videoUrl } poster={ thumbnailUrl } autoPlay={ autoPlay } controls loop={ loop } onLoadedMetadata={ () => {console.log("local onVideoLoad");props.onImageLoad();} } />;

    const attachedImage = (images?: { url: string }[]) =>
        images && images.length > 0 && imageWithOnLoad(images[0].url);

    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card hero'>
                    { attachedImage(attachment.content.images) }
                    <h1>{ attachment.content.title }</h1>
                    <h2>{ attachment.content.subtitle }</h2>
                    <p>{ attachment.content.text }</p>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card thumbnail'>
                    <h1>{ attachment.content.title }</h1>
                    <p>
                        { attachedImage(attachment.content.images) }
                        <h2>{ attachment.content.subtitle }</h2>
                        { attachment.content.text }
                    </p>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card video'>
                    { videoWithOnLoad(attachment.content.media[0].url, attachment.content.image ? attachment.content.image.url : null, attachment.content.autostart, attachment.content.autoloop) }
                    <h1>{ attachment.content.title }</h1>
                    <h2>{ attachment.content.subtitle }</h2>
                    <p>{ attachment.content.text }</p>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card audio'>
                    { audio(attachment.content.media[0].url, attachment.content.autostart, attachment.content.autoloop) }
                    <h1>{ attachment.content.title }</h1>
                    <h2>{ attachment.content.subtitle }</h2>
                    <p>{ attachment.content.text }</p>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card signin'>
                    <h1>{ attachment.content.text }</h1>
                    { buttons(attachment.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card receipt'>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={ 2 }>{ attachment.content.title }</th>
                            </tr>
                            { attachment.content.facts && attachment.content.facts.map(fact => <tr><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ attachment.content.items && attachment.content.items.map(item =>
                            <tr>
                                <td>{ item.image && imageWithOnLoad(item.image.url) }<span>{ item.title }</span></td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Tax</td>
                                <td>{ attachment.content.tax }</td>
                            </tr>
                            <tr className="total">
                                <td>Total</td>
                                <td>{ attachment.content.total }</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(attachment.contentUrl);

        case "audio/mpeg":
        case "audio/mp4":
            return audio(attachment.contentUrl);

        case "video/mp4":
            return videoWithOnLoad(attachment.contentUrl);

        default:
            return <span>[File of type '{ (attachment as any).contentType }']</span>;

    }
}