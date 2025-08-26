import React from 'react';
import { cn } from '@/lib/utils';

// Spinner component
export const Spinner = ({ size = 'default', className, ...props }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-6 h-6',
        large: 'w-8 h-8',
        xlarge: 'w-12 h-12'
    };

    return (
        <svg
            className={cn(
                'animate-spin text-current',
                sizeClasses[size],
                className
            )}
            fill="none"
            viewBox="0 0 24 24"
            {...props}
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};

// Loading button
export const LoadingButton = ({ 
    isLoading = false, 
    children, 
    className,
    spinnerSize = 'small',
    ...props 
}) => {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2',
                isLoading && 'cursor-not-allowed opacity-70',
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Spinner size={spinnerSize} />}
            {children}
        </button>
    );
};

// Page loading overlay
export const PageLoader = ({ message = 'Loading...', className }) => {
    return (
        <div className={cn(
            'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
            className
        )}>
            <div className="text-center">
                <Spinner size="large" className="mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">{message}</p>
            </div>
        </div>
    );
};

// Inline loader
export const InlineLoader = ({ 
    message = 'Loading...', 
    size = 'default',
    className 
}) => {
    return (
        <div className={cn('flex items-center justify-center gap-3 py-8', className)}>
            <Spinner size={size} className="text-primary" />
            <span className="text-sm text-muted-foreground font-medium">{message}</span>
        </div>
    );
};

// Skeleton components
export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted',
                className
            )}
            {...props}
        />
    );
};

// Card skeleton
export const CardSkeleton = ({ className }) => {
    return (
        <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
            <div className="space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
};

// Table row skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
};

// Dashboard stats skeleton
export const StatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Chat message skeleton
export const MessageSkeleton = ({ isUser = false }) => {
    return (
        <div className={`flex items-end space-x-2 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && <Skeleton className="w-8 h-8 rounded-full" />}
            <div className={`max-w-[70%] ${isUser ? 'mr-2' : 'ml-2'}`}>
                <div className={cn(
                    'rounded-2xl p-3 space-y-2',
                    isUser ? 'bg-primary/10' : 'bg-muted'
                )}>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            {isUser && <Skeleton className="w-8 h-8 rounded-full" />}
        </div>
    );
};

// List item skeleton
export const ListItemSkeleton = () => {
    return (
        <div className="flex items-center space-x-4 p-4 border-b border-border">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-16" />
        </div>
    );
};

// Form skeleton
export const FormSkeleton = () => {
    return (
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
};
