// Centralized logging system with environment-aware configuration
import { getEnvironmentConfig, getCurrentEnvironment } from './environments';
class Logger {
    constructor() {
        this.config = getEnvironmentConfig();
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    shouldLog(level) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        // Default to 'info' level if not specified in config
        const configLevel = this.config.showDebugInfo ? 'debug' : 'info';
        return levels[level] >= levels[configLevel];
    }
    formatMessage(level, message, context, data) {
        return {
            level,
            message,
            context,
            data,
            timestamp: new Date().toISOString(),
            environment: getCurrentEnvironment(),
            sessionId: this.sessionId
        };
    }
    log(level, message, context, data) {
        if (!this.shouldLog(level))
            return;
        const logEntry = this.formatMessage(level, message, context, data);
        // Console logging with appropriate method
        const consoleMethod = level === 'debug' ? 'log' : level;
        const prefix = `[${level.toUpperCase()}] ${logEntry.timestamp}`;
        const contextStr = context ? ` [${context}]` : '';
        console[consoleMethod](`${prefix}${contextStr}: ${message}`, data || '');
        // Send to external logging service in production
        if (!this.config.showDebugInfo && (level === 'error' || level === 'warn')) {
            this.sendToExternalService(logEntry);
        }
        // Store in local storage for debugging (development only)
        if (this.config.showDebugInfo) {
            this.storeLogEntry(logEntry);
        }
    }
    sendToExternalService(logEntry) {
        // TODO: Integrate with Sentry, LogRocket, or other monitoring service
        // For now, just log to console in production
        console.warn('External logging not implemented yet:', logEntry);
    }
    storeLogEntry(logEntry) {
        try {
            const storageKey = 'kiosk-logs';
            const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updatedLogs = [...existingLogs.slice(-99), logEntry]; // Keep last 100 entries
            localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
        }
        catch (error) {
            console.warn('Failed to store log entry:', error);
        }
    }
    debug(message, context, data) {
        this.log('debug', message, context, data);
    }
    info(message, context, data) {
        this.log('info', message, context, data);
    }
    warn(message, context, data) {
        this.log('warn', message, context, data);
    }
    error(message, context, data) {
        this.log('error', message, context, data);
    }
    // Kiosk-specific logging methods
    kioskAction(action, kioskId, data) {
        this.info(`Kiosk action: ${action}`, `kiosk-${kioskId}`, data);
    }
    paymentEvent(event, paymentId, data) {
        this.info(`Payment event: ${event}`, `payment-${paymentId}`, data);
    }
    apiCall(method, endpoint, duration, error) {
        const message = `API ${method} ${endpoint}${duration ? ` (${duration}ms)` : ''}`;
        if (error) {
            this.error(message, 'api-client', { error: error.message, stack: error.stack });
        }
        else {
            this.debug(message, 'api-client');
        }
    }
    // Get logs for debugging
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem('kiosk-logs') || '[]');
        }
        catch {
            return [];
        }
    }
    // Clear stored logs
    clearLogs() {
        localStorage.removeItem('kiosk-logs');
    }
}
// Export singleton instance
export const logger = new Logger();
// Export convenience functions
export const log = {
    debug: (message, context, data) => logger.debug(message, context, data),
    info: (message, context, data) => logger.info(message, context, data),
    warn: (message, context, data) => logger.warn(message, context, data),
    error: (message, context, data) => logger.error(message, context, data),
    kioskAction: (action, kioskId, data) => logger.kioskAction(action, kioskId, data),
    paymentEvent: (event, paymentId, data) => logger.paymentEvent(event, paymentId, data),
    apiCall: (method, endpoint, duration, error) => logger.apiCall(method, endpoint, duration, error),
};
