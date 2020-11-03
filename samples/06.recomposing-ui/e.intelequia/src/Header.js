import React, { useEffect, useMemo } from 'react';
const Header = ({headerOptions, handleSwitchButtonClick, handleMinimizeButtonClick}) => {

    const headerStyle = {
        backgroundColor: headerOptions.backgroundColor,
        color: headerOptions.color,
        height: headerOptions.height,
        backgroundImage: `url(${headerOptions.imageUrl})`
    };

    return (<header style={headerStyle}>
        <div className="filler" />
        <button className="switch" onClick={handleSwitchButtonClick}>
            <span className="ms-Icon ms-Icon--Switch" />
        </button>
        <button className="minimize" onClick={handleMinimizeButtonClick}>
            <span className="ms-Icon ms-Icon--ChromeMinimize" />
        </button>
    </header>);
}

export default Header;