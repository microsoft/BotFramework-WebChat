import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HistoryActions } from './App.tsx';

export const HeroCard = (props: {
    actions: HistoryActions,
    content: any
}) => {
    const buttonActions = {
        "imBack": props.actions.buttonImBack,
        "openUrl": props.actions.buttonOpenUrl,
        "postBack": props.actions.buttonPostBack
    }
    // REVIEW we need to make sure each button.type is one of these
    return (
        <div class="imageMessage">
            { props.content.images.map(image => <img src={ image.url } alt={ image.url } />) }
            <p><b>{ props.content.title }</b></p>
            <p><i>{ props.content.subtitle }</i></p>
            <p>{ props.content.text }</p>
            <ul>
            { props.content.buttons.map(button => <li><button onClick={ () => buttonActions[button.type](button.value) }>{ button.title }</button></li>) }
            </ul>
        </div>
    );
}