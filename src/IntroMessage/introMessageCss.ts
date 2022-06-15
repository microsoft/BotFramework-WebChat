export const introMessageCss = `
.intro-message {
    font-family: 'Segoe UI', sans-serif;

    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    margin-left: -10px;
    
		padding: 20px 16px;
    min-width: 250px;
    
    background: #385B75;
    color: #FFFFFF;
		cursor: pointer;
		
    border: 1px solid #16364D;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.0452719);
    border-radius: 10px 10px 10px 4px;
}

.intro-message__title {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 8px;
    padding-right: 20px;
}

.intro-message__message {
    font-size: 14px;
}

.intro-message__close-icon {
    position: absolute;
    top: 4px;
    right: 4px;
}

.intro-message__click-zone {
    width: 100%;
    height: 100%;
}

`;
