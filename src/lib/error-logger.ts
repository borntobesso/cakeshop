/**
 * Error Logging System for Print Failures and Other Critical Errors
 * Provides structured logging for troubleshooting and monitoring
 */

export interface PrintErrorLog {
  id: string;
  timestamp: string;
  orderId: string;
  orderNumber?: string;
  errorType: 'print_failure';
  severity: 'warning' | 'critical';
  errorMessage: string;
  technicalDetails: {
    printAttempts: number;
    successfulPrints: number;
    failedPrints: number;
    retryCount: number;
    printerApiResponse?: any;
    httpStatus?: number;
  };
  orderContext: {
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    pickupDate: string;
    pickupTime: string;
    paymentMethod: string;
    itemCount: number;
  };
  systemContext: {
    environment: string;
    userAgent?: string;
    printerConfig: {
      apiLogin?: string;
      storeId: number;
      ipAddress?: string;
      port?: string;
    };
  };
  resolution?: {
    resolved: boolean;
    resolvedAt?: string;
    resolution?: string;
    resolvedBy?: string;
  };
}

export interface ErrorLoggerConfig {
  logToConsole: boolean;
  logToFile: boolean;
  logToDatabase: boolean;
  maxLogSize: number;
  retentionDays: number;
}

const DEFAULT_CONFIG: ErrorLoggerConfig = {
  logToConsole: true,
  logToFile: process.env.NODE_ENV === 'production',
  logToDatabase: false, // Can be enabled later
  maxLogSize: 1000, // Maximum number of logs to keep in memory
  retentionDays: 30
};

class ErrorLogger {
  private config: ErrorLoggerConfig;
  private logs: PrintErrorLog[] = [];

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a print failure error with comprehensive context
   */
  async logPrintError(
    orderId: string,
    orderNumber: string | undefined,
    error: string,
    severity: 'warning' | 'critical',
    technicalDetails: PrintErrorLog['technicalDetails'],
    orderContext: PrintErrorLog['orderContext']
  ): Promise<string> {
    const logId = this.generateLogId();
    
    const errorLog: PrintErrorLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      orderId,
      orderNumber,
      errorType: 'print_failure',
      severity,
      errorMessage: error,
      technicalDetails,
      orderContext,
      systemContext: {
        environment: process.env.NODE_ENV || 'development',
        printerConfig: {
          apiLogin: process.env.NEXT_PUBLIC_HIBOUTIK_API_LOGIN?.substring(0, 5) + '***',
          storeId: 1,
          ipAddress: process.env.NEXT_PUBLIC_STORE_IP_ADDR?.replace(/\d+$/, 'xxx'),
          port: process.env.NEXT_PUBLIC_HIBOUTIK_PRINTER_PORT
        }
      }
    };

    // Store in memory
    this.logs.unshift(errorLog);
    
    // Trim logs if too many
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(0, this.config.maxLogSize);
    }

    // Log to different destinations
    if (this.config.logToConsole) {
      this.logToConsole(errorLog);
    }

    if (this.config.logToFile) {
      await this.logToFile(errorLog);
    }

    return logId;
  }

  /**
   * Retrieve logs with filtering options
   */
  getLogs(options: {
    severity?: 'warning' | 'critical';
    orderId?: string;
    limit?: number;
    since?: Date;
  } = {}): PrintErrorLog[] {
    let filteredLogs = [...this.logs];

    if (options.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === options.severity);
    }

    if (options.orderId) {
      filteredLogs = filteredLogs.filter(log => log.orderId === options.orderId);
    }

    if (options.since) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= options.since!);
    }

    if (options.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return filteredLogs;
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(since?: Date): {
    totalErrors: number;
    criticalErrors: number;
    warningErrors: number;
    errorsPerHour: number;
    commonErrors: { error: string; count: number }[];
    affectedOrders: number;
  } {
    const relevantLogs = since 
      ? this.logs.filter(log => new Date(log.timestamp) >= since)
      : this.logs;

    const errorCounts = relevantLogs.reduce((acc, log) => {
      acc[log.errorMessage] = (acc[log.errorMessage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const hoursSpan = since 
      ? Math.max(1, (Date.now() - since.getTime()) / (1000 * 60 * 60))
      : 24;

    return {
      totalErrors: relevantLogs.length,
      criticalErrors: relevantLogs.filter(log => log.severity === 'critical').length,
      warningErrors: relevantLogs.filter(log => log.severity === 'warning').length,
      errorsPerHour: relevantLogs.length / hoursSpan,
      commonErrors,
      affectedOrders: new Set(relevantLogs.map(log => log.orderId)).size
    };
  }

  /**
   * Mark an error as resolved
   */
  markResolved(logId: string, resolution: string, resolvedBy: string = 'system'): boolean {
    const log = this.logs.find(l => l.id === logId);
    if (!log) {
      return false;
    }

    log.resolution = {
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolution,
      resolvedBy
    };

    if (this.config.logToConsole) {
      console.log(`✅ Print error resolved: ${logId} - ${resolution}`);
    }

    return true;
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      // CSV export
      const headers = [
        'ID', 'Timestamp', 'Order ID', 'Order Number', 'Severity', 'Error', 
        'Attempts', 'Successful', 'Customer', 'Total', 'Pickup Date', 'Resolved'
      ];
      
      const rows = this.logs.map(log => [
        log.id,
        log.timestamp,
        log.orderId,
        log.orderNumber || '',
        log.severity,
        log.errorMessage,
        log.technicalDetails.printAttempts,
        log.technicalDetails.successfulPrints,
        log.orderContext.customerName,
        log.orderContext.totalAmount,
        log.orderContext.pickupDate,
        log.resolution?.resolved ? 'Yes' : 'No'
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  private generateLogId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `print_err_${timestamp}_${random}`;
  }

  private logToConsole(errorLog: PrintErrorLog): void {
    const icon = errorLog.severity === 'critical' ? '🚨' : '⚠️';
    const color = errorLog.severity === 'critical' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';

    console.log(`\n${color}${icon} PRINT ERROR LOGGED${reset}`);
    console.log(`${color}═══════════════════════════════════════${reset}`);
    console.log(`ID: ${errorLog.id}`);
    console.log(`Time: ${new Date(errorLog.timestamp).toLocaleString('fr-FR')}`);
    console.log(`Severity: ${errorLog.severity.toUpperCase()}`);
    console.log(`Order: ${errorLog.orderContext.customerName} (#${errorLog.orderNumber || errorLog.orderId.slice(-8)})`);
    console.log(`Error: ${errorLog.errorMessage}`);
    console.log(`Attempts: ${errorLog.technicalDetails.printAttempts} (${errorLog.technicalDetails.successfulPrints} successful)`);
    console.log(`Pickup: ${errorLog.orderContext.pickupDate} ${errorLog.orderContext.pickupTime}`);
    console.log(`${color}═══════════════════════════════════════${reset}\n`);
  }

  private async logToFile(errorLog: PrintErrorLog): Promise<void> {
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'print-errors.jsonl');
      
      // Ensure log directory exists
      try {
        await fs.access(logDir);
      } catch {
        await fs.mkdir(logDir, { recursive: true });
      }

      // Append to JSONL file (one JSON object per line)
      const logEntry = JSON.stringify(errorLog) + '\n';
      await fs.appendFile(logFile, logEntry, 'utf8');

    } catch (error) {
      console.error('Failed to write error log to file:', error);
    }
  }
}

// Singleton instance
let errorLogger: ErrorLogger | null = null;

export function getErrorLogger(): ErrorLogger {
  if (!errorLogger) {
    errorLogger = new ErrorLogger();
  }
  return errorLogger;
}

/**
 * Quick helper function to log print errors
 */
export async function logPrintError(
  order: any,
  error: string,
  severity: 'warning' | 'critical',
  technicalDetails: {
    printAttempts: number;
    successfulPrints: number;
    failedPrints: number;
    retryCount: number;
    printerApiResponse?: any;
    httpStatus?: number;
  }
): Promise<string> {
  const logger = getErrorLogger();
  
  const orderContext = {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    totalAmount: order.totalAmount,
    pickupDate: new Date(order.pickupDate).toLocaleDateString('fr-FR'),
    pickupTime: order.pickupTime,
    paymentMethod: order.paymentMethod,
    itemCount: order.items?.length || 0
  };

  return await logger.logPrintError(
    order.id,
    order.orderNumber,
    error,
    severity,
    technicalDetails,
    orderContext
  );
}

export { ErrorLogger };