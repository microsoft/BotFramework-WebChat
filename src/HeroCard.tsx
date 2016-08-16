import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ButtonActions } from './App.tsx';

const content = {
    'images': [{
        'url': 'https://directline.botframework.com/api/conversations/ED6JOQv89OE/messages/000000000000000005/images/0?t=WfnLyhBjpIE.dAA.RQBEADYASgBPAFEAdgA4ADkATwBFAC0AMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADUA.mp2jlxn00QE.KBkUJNnqGho.6XcDrf36WF1Pom4pxvmQw03wtstOsjsE24_ybIeULFQ',
        'alt': 'hello'
    }],
    'text': 'cardtext',
    'buttons': [{
        'type': 'imBack',
        'value': 'testingsuccess',
        'title': 'test1'
    }],
    'subtitle': 'herocardsubtitle',
    'title': 'herocardtest'
}

export const HeroCard = (props: {
    buttonActions: ButtonActions
}) =>
    <div class="imageMessage">
        { content.images.map(image => <img src={ image.url } alt={ image.url } />) }
        <p><b>{ content.title }</b></p>
        <p><i>{ content.subtitle }</i></p>
        <p>{ content.text }</p>
        <ul>
        { content.buttons.map(button => <li><button onClick={ () => props.buttonActions.imBack(button.value) }>{ button.title }</button></li>) }
        </ul>
    </div>;