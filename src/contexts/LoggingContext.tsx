/**
 * SentinelScan — Logging Context
 * Path: src/contexts/LoggingContext.tsx
 *
 * Provides appLogger instance via React Context for use in components.
 */

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { appLogger, AppLogger, AppLogLevel, AppLogModule } from '@/lib/appLogger';

interface LoggingContextValue {
  logger: AppLogger;
  log: (level: AppLogLevel, module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
  debug: (module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
  info: (module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
  warn: (module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
  error: (module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
  fatal: (module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) => void;
}

const LoggingContext = createContext<LoggingContextValue | null>(null);

export function LoggingProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    appLogger.info('app', 'Application logger initialized');
    return () => {
      appLogger.info('app', 'Application logger destroyed');
      appLogger.destroy();
    };
  }, []);

  const value: LoggingContextValue = {
    logger: appLogger,
    log: (level, module, message, data, component) => appLogger.log(level, module, message, data, component),
    debug: (module, message, data, component) => appLogger.debug(module, message, data, component),
    info: (module, message, data, component) => appLogger.info(module, message, data, component),
    warn: (module, message, data, component) => appLogger.warn(module, message, data, component),
    error: (module, message, data, component) => appLogger.error(module, message, data, component),
    fatal: (module, message, data, component) => appLogger.fatal(module, message, data, component),
  };

  return (
    <LoggingContext.Provider value={value}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLoggingContext() {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error('useLoggingContext must be used within a LoggingProvider');
  }
  return context;
}
