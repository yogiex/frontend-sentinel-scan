/**
 * SentinelScan — useLogger Hook
 * Path: src/hooks/useLogger.ts
 *
 * Convenient hook for logging in React components.
 * Automatically includes component name in log entries.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLoggingContext } from '@/contexts/LoggingContext';
import { AppLogLevel, AppLogModule } from '@/lib/appLogger';

interface UseLoggerOptions {
  name?: string;
  logMount?: boolean;
  logUnmount?: boolean;
}

export function useLogger(options: UseLoggerOptions = {}) {
  const { name, logMount = true, logUnmount = true } = options;
  const { logger, debug, info, warn, error, fatal } = useLoggingContext();

  // Get component name from options or derive from call stack
  const componentName = useRef(name || 'Unknown');

  // Log mount/unmount
  useEffect(() => {
    const name = componentName.current;
    if (logMount) {
      logger.componentMount(name);
    }
    return () => {
      if (logUnmount) {
        logger.componentUnmount(name);
      }
    };
  }, [logMount, logUnmount, logger]);

  const log = useCallback(
    (level: AppLogLevel, module: AppLogModule, message: string, data?: Record<string, unknown>) => {
      return logger.log(level, module, message, data, componentName.current);
    },
    [logger]
  );

  return {
    logger,
    log,
    debug: useCallback((module: AppLogModule, message: string, data?: Record<string, unknown>) =>
      debug(module, message, data, componentName.current), [debug]),
    info: useCallback((module: AppLogModule, message: string, data?: Record<string, unknown>) =>
      info(module, message, data, componentName.current), [info]),
    warn: useCallback((module: AppLogModule, message: string, data?: Record<string, unknown>) =>
      warn(module, message, data, componentName.current), [warn]),
    error: useCallback((module: AppLogModule, message: string, data?: Record<string, unknown>) =>
      error(module, message, data, componentName.current), [error]),
    fatal: useCallback((module: AppLogModule, message: string, data?: Record<string, unknown>) =>
      fatal(module, message, data, componentName.current), [fatal]),

    // Convenience methods
    logFormSubmit: useCallback((formName: string, data?: Record<string, unknown>) =>
      logger.formSubmit(formName, data), [logger]),
    logFormError: useCallback((formName: string, errors: Record<string, string>) =>
      logger.formError(formName, errors), [logger]),
    logNavigate: useCallback((from: string, to: string) =>
      logger.navigate(from, to), [logger]),
    logUI: useCallback((element: string, action: string, data?: Record<string, unknown>) =>
      logger.uiInteraction(element, action, data), [logger]),
    logPerf: useCallback((metric: string, value: number, unit?: string) =>
      logger.performanceMetric(metric, value, unit), [logger]),
    logError: useCallback((err: Error | unknown, context?: string) =>
      logger.captureError(err, context), [logger]),
  };
}
