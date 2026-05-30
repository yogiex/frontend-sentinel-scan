/**
 * SentinelScan — withFormLogger HOC
 * Path: src/utils/withFormLogger.tsx
 *
 * Higher-Order Component that wraps form components
 * and auto-logs form submissions.
 */

import { ComponentType, useState, useEffect } from 'react';
import { auditLogger } from '@/lib/logger';

export interface WithFormLoggerOptions {
  /** Form name / identifier for logging */
  formName: string;
  /** Log level for submissions (default: 'info') */
  level?: 'debug' | 'info' | 'warn';
  /** Whether to log mount/unmount of the form */
  logMount?: boolean;
}

/**
 * HOC that wraps a form component to auto-log submissions.
 *
 * Usage:
 *   export default withFormLogger(LoginForm, { formName: 'login' });
 */
export function withFormLogger<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithFormLoggerOptions
): ComponentType<P> {
  const { formName, logMount = true } = options;

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function FormLoggerWrapper(props: P) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (logMount) {
        auditLogger.info('system', `${formName}_form_mount`, { form: formName });
      }
      return () => {
        if (logMount) {
          auditLogger.info('system', `${formName}_form_unmount`, { form: formName });
        }
      };
    }, []);

    const handleSubmit = () => {
      setIsSubmitting(true);
      auditLogger.info('system', `${formName}_form_submit`, {
        form: formName,
        submitting: true,
      });
    };

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <WrappedComponent {...props} isSubmitting={isSubmitting} />
      </form>
    );
  }

  FormLoggerWrapper.displayName = `withFormLogger(${displayName})`;

  return FormLoggerWrapper;
}
