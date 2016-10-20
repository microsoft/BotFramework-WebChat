import { getStore, getState } from './Store';

export enum Severity {
    info,
    trace,
    debug,
    warn,
    error
}

export interface IConsoleEntry {
    severity?: Severity,
    message?: any,
    args?: any[]
}

export interface IConsoleProvider {
    add: (severity: Severity, message: any, ...args: any[]) => void,
    log: (message: any, ...args: any[]) => void,
    info: (message: any, ...args: any[]) => void,
    trace: (message: any, ...args: any[]) => void,
    debug: (message: any, ...args: any[]) => void,
    warn: (message: any, ...args: any[]) => void,
    error: (message: any, ...args: any[]) => void
}

export class BuiltinConsoleProvider implements IConsoleProvider {
    add = (severity: Severity, message: any, ...args: any[]) => {
        console[Severity[severity]](message, ...args);
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

export class NullConsoleProvider implements IConsoleProvider {
    add = (severity: Severity, message: any, ...args: any[]) => { }
    log = (message: any, ...args: any[]) => { }
    info = (message: any, ...args: any[]) => { }
    trace = (message: any, ...args: any[]) => { }
    debug = (message: any, ...args: any[]) => { }
    warn = (message: any, ...args: any[]) => { }
    error = (message: any, ...args: any[]) => { }
}
