/**
 * SentinelScan — 4xx Error Page
 * Path: src/pages/error/4xx.tsx
 *
 * Error page for HTTP 4xx client errors (400-499).
 * Displays user-friendly error messages with consistent theming.
 */

import { ReactNode } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
}

export function Error4xx(): ReactNode {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError;

  // Determine error type and message based on status code
  const getErrorDetails = (status?: number) => {
    switch (status) {
      case 400:
        return {
          title: 'Bad Request',
          message: 'The server cannot process your request due to invalid syntax.',
          description: 'Please check your input and try again.'
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'You need to authenticate to access this resource.',
          description: 'Please log in to continue.'
        };
      case 403:
        return {
          title: 'Forbidden',
          message: 'You don\'t have permission to access this resource.',
          description: 'Contact your administrator if you believe this is an error.'
        };
      case 404:
        return {
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist.',
          description: 'The URL might be incorrect or the page has been moved.'
        };
      case 429:
        return {
          title: 'Too Many Requests',
          message: 'You\'ve made too many requests recently.',
          description: 'Please wait a moment before trying again.'
        };
      default:
        return {
          title: 'Client Error',
          message: 'Something went wrong with your request.',
          description: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const errorDetails = getErrorDetails(error?.status);
  const statusCode = error?.status || 400;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
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

            <Button variant="primary" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
