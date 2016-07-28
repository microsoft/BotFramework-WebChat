import * as React from 'react';
import * as ReactDOM from 'react-dom';

type TimeStuff = (timeout:number) => [string, number];

const timeStuff:TimeStuff = (timestamp:number) => {
    const milliseconds = Date.now() - timestamp;
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (minutes < 1)
        return ["Now", 60 * 1000];
    else if (minutes === 1)
        return [`1 minute`, 60 * 1000];
    else if (hours < 1)
        return [`${minutes} minutes`, 60 * 1000];
    else if (hours === 1)
        return [`1 hour`, 60 * 60 * 1000];
    else if (hours < 5)
        return [`${hours} hours`, 60 * 60 * 1000 * (5 - hours)];
    else if (hours <= 24)
        return ["today", 60 * 60 * 1000 * (24 - hours)];
    else if (hours <= 48)
        return ["yesterday", 60 * 60 * 1000 * (48 - hours)];
    else
        return [new Date (milliseconds).toLocaleDateString(), null]; 
}

interface Props {
    timestamp: number
}

export class Timestamp extends React.Component<Props, {}> {
    private nextRender:number;
    constructor(props:Props) {
        super();
        this.nextRender = null;
    }

    private setNextRender(timestamp:number) {
        const ts = timeStuff(timestamp);
        if (ts[1])
            this.nextRender = setTimeout(() => {
                this.forceUpdate();
                this.setNextRender(timestamp);
            }, ts[1])
    }

    componentDidMount() {
        this.setNextRender(this.props.timestamp);
    }

    componentWillUnmount() {
        clearTimeout(this.nextRender);
    }

    render() {
        return <p><i>{ timeStuff(this.props.timestamp)[0]})</i></p>;
    }
}
