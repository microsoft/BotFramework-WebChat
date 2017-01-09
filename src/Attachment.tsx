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

const Media = (props: {
    src: string,
    type?: 'image' | 'video' | 'audio',   // defaults to 'image'
    poster?: string,
    autoPlay?:boolean,
    loop?: boolean,
    onLoad?: () => void,
    onClick?: () => void,
}) => {
    const { type, ... mediaProps } = props; // this allows us to keep 'type' out of the final HTML
    switch (type) {
        case 'video':
            return <video controls {... mediaProps } />;
        case 'audio':
            return <audio controls { ... mediaProps } />;
        default:
            return <img { ... mediaProps } />;
    }
}

// 'tap' is a deprecated field for Skype channels. For testing legacy bots in Emulator only.
const attachedImage = (
    images: { url: string,  tap?: Button }[],
    onImageLoad: () => void,
    onClickButton?: (type: string, value: string) => void   // Enables FlexCards in Emulator
 ) => {
    if (!images || images.length === 0)
        return null;
    const image = images[0];
    const tap = onClickButton && image.tap;
    return <Media src={ image.url } onLoad={ onImageLoad } onClick={ tap && (() => onClickButton(tap.type, tap.value)) } />;
 }

const mediaType = (url: string) =>
    url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif' ? 'image' : 'video';

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
                    <Media
                        type='video'
                        src={ attachment.content.media[0].url }
                        onLoad={ props.onImageLoad }
                        poster={ attachment.content.image && attachment.content.image.url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
                    { title(attachment.content.title) }
                    { subtitle(attachment.content.subtitle) }
                    { text(attachment.content.text) }
                    { buttons(attachment.content.buttons, props.onClickButton) }
                </div>
            );


        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;            
            return (
                <div className='wc-card animation'>
                    <Media 
                        type={ mediaType(attachment.content.media[0].url) }
                        src={ attachment.content.media[0].url }
                        onLoad={ props.onImageLoad }
                        poster={ attachment.content.image && attachment.content.image.url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
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
                    <Media
                        type='audio'
                        src={ attachment.content.media[0].url }
                        autoPlay={ attachment.content.autostart }
                        loop={ attachment.content.autoloop }
                    />
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
                                <td>
                                    { item.image && <Media src={ item.image.url } onLoad={ props.onImageLoad } /> }
                                    <span>{ item.title }</span>
                                </td>
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

        // Deprecated format for Skype channels. For testing legacy bots in Emulator only.
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
            return <Media src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        case "audio/mpeg":
        case "audio/mp4":
            return <Media type='audio' src={ attachment.contentUrl } />;

        case "video/mp4":
            return <Media type='video' src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        default:
            const contentType = (attachment as any).contentType;
            const unknown = regExpCard.test(contentType) ? props.format.strings.unknownCard : props.format.strings.unknownFile;
            return <span>{ unknown.replace('%1', contentType) }</span>;
    }        
}