import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const ImageMessage = (props: {
    images: string[]
}) =>
    <div class="imageMessage">
        { props.images.map(path => <img src= { path }/>) }
    </div>;