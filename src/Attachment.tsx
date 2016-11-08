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

    const att = props.attachment;
    
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
        <img src={ url } onLoad={ () => {console.log("local onImageLoad");props.onImageLoad();} } />;

    const videoWithOnLoad = (videoUrl: string, thumbnailUrl?: string, autoPlay?:boolean, loop?: boolean) =>
        <video src={ videoUrl } poster={ thumbnailUrl } autoPlay={ autoPlay } controls loop={ loop } onLoadedMetadata={ () => {console.log("local onVideoLoad");props.onImageLoad();} } />;

    const attachedImage = (images?: { url: string }[]) =>
        images && imageWithOnLoad(images[0].url);

    switch (att.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (
                <div className='wc-card hero'>
                    { attachedImage(att.content.images) }
                    <h1>{ att.content.title }</h1>
                    <h2>{ att.content.subtitle }</h2>
                    <p>{ att.content.text }</p>
                    { buttons(att.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            return (
                <div className='wc-card thumbnail'>
                    <h1>{ att.content.title }</h1>
                    <p>
                        { attachedImage(att.content.images) }
                        <h2>{ att.content.subtitle }</h2>
                        { att.content.text }
                    </p>
                    { buttons(att.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.video":

            var thumbnail: string;

            if (att.content.image) thumbnail = att.content.image.url;
            
            return (
                <div className='wc-card video'>
                    { videoWithOnLoad(att.content.media[0].url, thumbnail, att.content.autostart, att.content.autoloop) }
                    <h1>{ att.content.title }</h1>
                    <h2>{ att.content.subtitle }</h2>
                    <p>{ att.content.text }</p>
                    { buttons(att.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            return (
                <div className='wc-card signin'>
                    <h1>{ att.content.text }</h1>
                    { buttons(att.content.buttons) }
                </div>
            );

        case "application/vnd.microsoft.card.receipt":
            return (
                <div className='wc-card receipt'>
                    <table>
                        <thead>
                            <tr>
                                <th colSpan={ 2 }>{ att.content.title }</th>
                            </tr>
                            { att.content.facts && att.content.facts.map(fact => <tr><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ att.content.items && att.content.items.map(item =>
                            <tr>
                                <td>{ item.image && imageWithOnLoad(item.image.url) }<span>{ item.title }</span></td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Tax</td>
                                <td>{ att.content.tax }</td>
                            </tr>
                            <tr className="total">
                                <td>Total</td>
                                <td>{ att.content.total }</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(att.contentUrl);

        case "video/mp4":
            return videoWithOnLoad(att.contentUrl);

        default:
            return <span/>;

    }
}