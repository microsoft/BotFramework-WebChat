export const popupMessageCss = `
.popup-message {
    font-family: 'Segoe UI', sans-serif;
    transition: 300ms all ease-in-out;
		opacity: 1;
	
    position: absolute;
    left: 0;
    bottom: 24px;
    transform: translateX(-100%);
    margin-left: -10px;
    
		padding: 20px 20px;
    min-width: 265px;
    
    background: #385B75;
    color: #FFFFFF;
		cursor: pointer;
		
    border: 1px solid #16364D;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.0452719);
    border-radius: 10px 10px 4px 10px;
}

.popup-message.popup-message--initial {
  left: 8px;
  bottom: 17px;
  opacity: 0;
}

.popup-message__title {
    font-size: 15px;
    font-weight: bold;
		margin-bottom: 5px;
    padding-right: 20px;
}

.popup-message__message {
    font-size: 14px;
    line-height: 1.5;
}

.popup-message__close-icon {
    position: absolute;
    top: 4px;
    right: 4px;
}

.popup-message__click-zone {
    width: 100%;
    height: 100%;
}

`;
