export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: string;
    data?: any;
    timestamp: string;
    environment: string;
    sessionId: string;
}
declare class Logger {
    private sessionId;
    private config;
    constructor();
    private shouldLog;
    private formatMessage;
    private log;
    private sendToExternalService;
    private storeLogEntry;
    debug(message: string, context?: string, data?: any): void;
    info(message: string, context?: string, data?: any): void;
    warn(message: string, context?: string, data?: any): void;
    error(message: string, context?: string, data?: any): void;
    kioskAction(action: string, kioskId: number, data?: any): void;
    paymentEvent(event: string, paymentId: string, data?: any): void;
    apiCall(method: string, endpoint: string, duration?: number, error?: Error): void;
    getLogs(): LogEntry[];
    clearLogs(): void;
}
export declare const logger: Logger;
export declare const log: {
    debug: (message: string, context?: string, data?: any) => void;
    info: (message: string, context?: string, data?: any) => void;
    warn: (message: string, context?: string, data?: any) => void;
    error: (message: string, context?: string, data?: any) => void;
    kioskAction: (action: string, kioskId: number, data?: any) => void;
    paymentEvent: (event: string, paymentId: string, data?: any) => void;
    apiCall: (method: string, endpoint: string, duration?: number, error?: Error) => void;
};
export {};
