import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App.tsx';

const content = {
    'images': [{
        'url': 'http://thiswas.notinventedhe.re/on/2009-09-21',
        'alt': 'Image alt text'
    }],
    'text': 'This is the hero card text',
    'buttons': [{
        'type': 'imBack',
        'value': 'imBack value',
        'title': 'imBack title'
    }, {
        'type': 'openUrl',
        'value': 'openUrl value',
        'title': 'openUrl title'
    }, {
        'type': 'postBack',
        'value': 'postBack value',
        'title': 'postBack title'
    }],
    'subtitle': 'Subtitle',
    'title': 'Title'
}

export const HeroCard = (props: {
    actions: HistoryActions
}) => {
    const buttonActions = {
        "imBack": props.actions.buttonImBack,
        "openUrl": props.actions.buttonOpenUrl,
        "postBack": props.actions.buttonPostBack
    }
    // REVIEW we need to make sure each button.type is one of these
    return (
        <div class="imageMessage">
            { content.images.map(image => <img src={ image.url } alt={ image.url } />) }
            <p><b>{ content.title }</b></p>
            <p><i>{ content.subtitle }</i></p>
            <p>{ content.text }</p>
            <ul>
            { content.buttons.map(button => <li><button onClick={ () => buttonActions[button.type](button.value) }>{ button.title }</button></li>) }
            </ul>
        </div>
    );
}