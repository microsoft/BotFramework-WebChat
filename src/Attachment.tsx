import * as React from 'react';
import { Attachment, Button } from './BotConnection';
import { renderIfNonempty, konsole } from './Chat';
import { FormatState } from './Store';

const regExpCard = /\^application\/vnd\.microsoft\.card\./i;

const buttons = (
    buttons: Button[],
    onClickButton: (type: string, value: string) => void
) => buttons &&
    <ul className="wc-card-buttons">
        { buttons.map((button, index) => <li key={ index }><button onClick={ () => onClickButton(button.type, button.value) }>{ button.title }</button></li>) }
    </ul>;

const imageWithOnLoad = (
    url: string,
    onImageLoad: () => void,
    onClick?: () => void,       // Enables FlexCards in Emulator
    thumbnailUrl?: string,
    autoPlay?:boolean,
    loop?: boolean
) =>
    <img src={ url } autoPlay = { autoPlay } loop = { loop } poster = { thumbnailUrl } onLoad={ onImageLoad } onClick = { onClick }/>;

const attachedImage = (
    images: { url: string,  tap?: Button }[],
    onImageLoad: () => void,
    onClickButton?: (type: string, value: string) => void   // Enables FlexCards in Emulator
 ) => {
    if (!images || images.length === 0)
        return null;
    const image = images[0];
    const tap = onClickButton && image.tap;
    return imageWithOnLoad(image.url, onImageLoad, tap && (() => onClickButton(tap.type, tap.value)));
 }

const audio = (
    audioUrl: string,
    autoPlay?:boolean,
    loop?: boolean
) =>
    <audio src={ audioUrl } autoPlay={ autoPlay } controls loop={ loop } />;

const videoWithOnLoad = (
    videoUrl: string,
    onImageLoad: () => void,
    onClick?: () => void,
    thumbnailUrl?: string,
    autoPlay?:boolean,
    loop?: boolean
) =>
    <video src={ videoUrl } poster={ thumbnailUrl } autoPlay={ autoPlay } controls loop={ loop } onLoadedMetadata={ onImageLoad } />;

const isGifMedia = (url: string) =>
    url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif';

const title = (title: string) => renderIfNonempty(title, title => <h1>{ title }</h1>);
const subtitle = (subtitle: string) => renderIfNonempty(subtitle, subtitle => <h2>{ subtitle }</h2>);
const text = (text: string) => renderIfNonempty(text, text => <p>{ text }</p>);

export const AttachmentView = (props: {
    format: FormatState;
    attachment: Attachment,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    if (!props.attachment) return;

    const attachment = props.attachment;

    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card hero'>
                    { attachedImage(attachment.content.images, props.onImageLoad) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );

        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card thumbnail'>
                    { title(attachment.content.title) }
                    { attachedImage(attachment.content.images, props.onImageLoad) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );

        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card video'>
                    { videoWithOnLoad(attachment.content.media[0].url, props.onImageLoad, attachment.content.image ? attachment.content.image.url : null, attachment.content.autostart, attachment.content.autoloop) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );


        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;            
            const media = isGifMedia(attachment.content.media[0].url) ? imageWithOnLoad : videoWithOnLoad; 
            return (
                <div className='wc-card animation'>
                    { media(attachment.content.media[0].url, props.onImageLoad, undefined, attachment.content.image ? attachment.content.image.url : null, attachment.content.autostart, attachment.content.autoloop) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );

        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <div className='wc-card audio'>
                    { audio(attachment.content.media[0].url, attachment.content.autostart, attachment.content.autoloop) }
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );

        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card signin'>
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
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
                            { attachment.content.facts && attachment.content.facts.map((fact, i) => <tr key={'fact' + i}><th>{ fact.key }</th><th>{ fact.value }</th></tr>) }
                        </thead>
                        <tbody>{ attachment.content.items && attachment.content.items.map((item, i) =>
                            <tr key={'item' + i}>
                                <td>{ imageWithOnLoad(item.image.url, props.onImageLoad) }<span>{ item.title }</span></td>
                                <td>{ item.price }</td>
                            </tr>) }
                        </tbody>
                        <tfoot>
                            { renderIfNonempty(
                                attachment.content.tax,
                                tax => <tr>
                                    <td>{ props.format.strings.receiptTax }</td>
                                    <td>{ attachment.content.tax }</td>
                                </tr>)
                            }
                            { renderIfNonempty(
                                attachment.content.total,
                                total => <tr className="total">
                                    <td>{ props.format.strings.receiptTotal }</td>
                                    <td>{ attachment.content.total }</td>
                                </tr>)
                            }
                        </tfoot>
                    </table>
                </div>
            );

        // FlexCard is specific to Skype channels. Used by Emulator ony.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (
                <div className='wc-card flex'>
                    { attachedImage(attachment.content.images, props.onImageLoad, props.onClickButton) }
                    { renderIfNonempty(attachment.content.title, title => <h1>{title}</h1>) }
                    { renderIfNonempty(attachment.content.subtitle, subtitle => <h2>{subtitle}</h2>) }
                    { renderIfNonempty(attachment.content.text, text => <p>{text}</p>) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );

        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(attachment.contentUrl, props.onImageLoad);

        case "audio/mpeg":
        case "audio/mp4":
            return audio(attachment.contentUrl);

        case "video/mp4":
            return videoWithOnLoad(attachment.contentUrl, props.onImageLoad);

        default:
            const unknown = regExpCard.test((attachment as any).contentType) ? props.format.strings.unknownCard : props.format.strings.unknownFile;
            return <span>{ unknown..replace('%1', (attachment as any).contentType) }</span>;
    }        
}