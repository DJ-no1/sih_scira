'use client';

import { Component, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
}

export class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        console.error('ChatErrorBoundary caught an error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log the error details
        console.error('Chat error boundary caught:', error, errorInfo);

        // Call the optional onError callback
        this.props.onError?.(error, errorInfo);

        // Show a toast notification
        toast.error('Chat Error', {
            description: 'An unexpected error occurred in the chat interface. Please refresh the page.',
        });
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 text-red-500">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        An unexpected error occurred in the chat interface.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}