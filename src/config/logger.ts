// Centralized logging system with environment-aware configuration

import { getEnvironmentConfig, getCurrentEnvironment } from './environments';

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

class Logger {
  private sessionId: string;
  private config = getEnvironmentConfig();
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Default to 'info' level if not specified in config
    const configLevel = this.config.showDebugInfo ? 'debug' : 'info';
    return levels[level] >= levels[configLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
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

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

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

  private sendToExternalService(logEntry: LogEntry): void {
    // TODO: Integrate with Sentry, LogRocket, or other monitoring service
    // For now, just log to console in production
    console.warn('External logging not implemented yet:', logEntry);
  }

  private storeLogEntry(logEntry: LogEntry): void {
    try {
      const storageKey = 'kiosk-logs';
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedLogs = [...existingLogs.slice(-99), logEntry]; // Keep last 100 entries
      
      localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  // Kiosk-specific logging methods
  kioskAction(action: string, kioskId: number, data?: any): void {
    this.info(`Kiosk action: ${action}`, `kiosk-${kioskId}`, data);
  }

  paymentEvent(event: string, paymentId: string, data?: any): void {
    this.info(`Payment event: ${event}`, `payment-${paymentId}`, data);
  }

  apiCall(method: string, endpoint: string, duration?: number, error?: Error): void {
    const message = `API ${method} ${endpoint}${duration ? ` (${duration}ms)` : ''}`;
    
    if (error) {
      this.error(message, 'api-client', { error: error.message, stack: error.stack });
    } else {
      this.debug(message, 'api-client');
    }
  }

  // Get logs for debugging
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('kiosk-logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearLogs(): void {
    localStorage.removeItem('kiosk-logs');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: string, data?: any) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: any) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: any) => logger.warn(message, context, data),
  error: (message: string, context?: string, data?: any) => logger.error(message, context, data),
  kioskAction: (action: string, kioskId: number, data?: any) => logger.kioskAction(action, kioskId, data),
  paymentEvent: (event: string, paymentId: string, data?: any) => logger.paymentEvent(event, paymentId, data),
  apiCall: (method: string, endpoint: string, duration?: number, error?: Error) => logger.apiCall(method, endpoint, duration, error),
};
