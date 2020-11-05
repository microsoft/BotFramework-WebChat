import React from 'react';
const MaximizeButton = ({maximizeOptions, handleMaximizeButtonClick, token, newMessage,minimized}) => {

    const maximizeStyle = {
        backgroundColor: maximizeOptions.backgroundColor,
        backgroundImage: `url(${maximizeOptions.imageUrl})`
    };

    return (<button style={maximizeStyle} className={minimized == true ? 'maximize close-button-no-animate' : 'maximize open-button-animate'} onClick={handleMaximizeButtonClick}>
               {maximizeOptions == undefined ||  maximizeOptions == ''  ? '' : <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />} 
                {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
            </button>);
}

export default MaximizeButton;