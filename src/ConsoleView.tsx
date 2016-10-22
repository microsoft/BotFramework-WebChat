import * as React from 'react';
import { Reducer } from 'redux';
import { Severity, IConsoleEntry, IConsoleProvider } from './ConsoleProvider';
import { Subscription, Observable, Subject } from '@reactivex/rxjs';
import { getStore, getState, ConsoleAction } from './Store';


var console$ = new Subject<IConsoleEntry>();

export class ConsoleProvider implements IConsoleProvider {
    add = (severity: Severity, message: any, ...args: any[]) => {
        let entry: IConsoleEntry = { severity, message, args };
        console$.next(entry);
        console.log(message, ...args);
    }
    log = (message: any, ...args: any[]) => {
        this.add(Severity.info, message, ...args);
    }
    info = (message: any, ...args: any[]) => {
        this.add(Severity.info, message, ...args);
    }
    trace = (message: any, ...args: any[]) => {
        this.add(Severity.trace, message, ...args);
    }
    debug = (message: any, ...args: any[]) => {
        this.add(Severity.debug, message, ...args);
    }
    warn = (message: any, ...args: any[]) => {
        this.add(Severity.warn, message, ...args);
    }
    error = (message: any, ...args: any[]) => {
        this.add(Severity.error, message, ...args);
    }
}

export interface IConsoleViewState {
    entries: IConsoleEntry[]
}

export class ConsoleView extends React.Component<{}, IConsoleViewState> {
    scrollMe: any;
    autoscrollSubscription: Subscription;
    consoleSubscription: Subscription;
    storeUnsubscribe: any;

    constructor(props) {
        super(props);
        this.state = { entries: [] };
    }

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() =>
            this.forceUpdate()
        );
    }

    componentDidMount() {
        this.autoscrollSubscription = Observable
            .fromEvent<any>(this.scrollMe, 'scroll')
            .map(e => e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight)
            .distinctUntilChanged()
            .subscribe(autoscroll =>
                getStore().dispatch({ type: 'Set_Autoscroll', autoscroll } as ConsoleAction)
            );
        this.consoleSubscription = console$.subscribe(
            entry => {
                let newState: IConsoleViewState = { entries: [...this.state.entries, entry] };
                this.setState(newState);
            }
        )
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
        this.consoleSubscription.unsubscribe();
        this.storeUnsubscribe();
    }

    componentDidUpdate(prevProps: {}, prevState: {}) {
        if (getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    render() {
        return (
            <div className="wc-consoleview" ref={ref => this.scrollMe = ref}>
                {this.state.entries
                    .map((entry, i) =>
                        <div className={'wc-consoleview-' + Severity[entry.severity]} key={i}>
                            { textForEntry(entry) }
                        </div>
                    )
                }
            </div>
        );
    }
}

const textForEntry = (entry: IConsoleEntry): string => {
    const safeStringify = (o: any, space: string | number = undefined): string => {
        let cache = [];
        return JSON.stringify(o, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return;
                }
                cache.push(value);
            }
            return value;
        }, space);
    }

    var rest = '';
    if (entry.args && entry.args.length) {
        rest = ', ' + entry.args.filter(arg => !!arg).map(arg => safeStringify(arg)).join(', ');
    }
    return `${entry.message}${rest}`;
}
