/**
 * SentinelScan — 5xx Error Page
 * Path: src/pages/error/500.tsx
 *
 * Error page for HTTP 5xx server errors (500-599).
 * Displays server error messages with debugging information.
 */

import { ReactNode } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  stack?: string;
}

export function Error5xx(): ReactNode {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError;

  // Determine error type and message based on status code
  const getErrorDetails = (status?: number) => {
    switch (status) {
      case 500:
        return {
          title: 'Internal Server Error',
          message: 'The server encountered an unexpected condition.',
          description: 'This is usually a temporary issue. Please try again later.'
        };
      case 502:
        return {
          title: 'Bad Gateway',
          message: 'The server received an invalid response from an upstream server.',
          description: 'This is a temporary network issue. Please try again.'
        };
      case 503:
        return {
          title: 'Service Unavailable',
          message: 'The server is temporarily unable to handle the request.',
          description: 'The service may be undergoing maintenance. Please try again later.'
        };
      case 504:
        return {
          title: 'Gateway Timeout',
          message: 'The server did not receive a timely response from an upstream server.',
          description: 'This is a temporary network issue. Please try again.'
        };
      default:
        return {
          title: 'Server Error',
          message: 'The server encountered an unexpected error.',
          description: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const errorDetails = getErrorDetails(error?.status);
  const statusCode = error?.status || 500;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Bug className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
            {statusCode} - {errorDetails.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              {errorDetails.message}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {errorDetails.description}
            </p>
          </div>

          {error?.message && (
            <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-3">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Error: {error.message}
              </p>
            </div>
          )}

          {import.meta.env.DEV && error?.stack && (
            <details className="rounded-md bg-red-50 dark:bg-red-900/10 p-3">
              <summary className="text-xs font-mono font-bold text-red-700 dark:text-red-300 cursor-pointer">
                Stack Trace (Development Only)
              </summary>
              <pre className="mt-2 text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 font-mono border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1 font-mono border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={() => navigate('/')}
              className="flex-1 font-mono bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
