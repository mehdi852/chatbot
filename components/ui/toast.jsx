"use client";
import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle, InfoIcon } from 'lucide-react';

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border-l-4 p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-blue-500 bg-white text-gray-900",
        success: "border-green-500 bg-white text-gray-900",
        destructive: "border-red-500 bg-white text-gray-900",
        warning: "border-yellow-500 bg-white text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const getIcon = (variant) => {
  const iconProps = "h-5 w-5";
  switch (variant) {
    case "success":
      return <CheckCircle2 className={`${iconProps} text-green-500`} />;
    case "destructive":
      return <XCircle className={`${iconProps} text-red-500`} />;
    case "warning":
      return <AlertCircle className={`${iconProps} text-yellow-500`} />;
    default:
      return <InfoIcon className={`${iconProps} text-blue-500`} />;
  }
};

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), 
        "backdrop-blur-sm bg-white/95 border border-gray-200",
        className)}
      {...props}
    >
      <div className="flex items-start gap-4 w-full">
        <div className="flex-shrink-0">
          {getIcon(variant)}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {props.children}
        </div>
      </div>
    </ToastPrimitives.Root>
  );
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      "border border-gray-200 px-3 py-2 hover:bg-gray-100 focus:ring-gray-400",
      "group-[.destructive]:border-red-100 group-[.destructive]:hover:border-red-200 group-[.destructive]:hover:bg-red-50 group-[.destructive]:focus:ring-red-400",
      "group-[.success]:border-green-100 group-[.success]:hover:border-green-200 group-[.success]:hover:bg-green-50 group-[.success]:focus:ring-green-400",
      className
    )}
    {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-400 group-[.destructive]:focus:ring-red-400",
      "group-[.success]:text-green-300 group-[.success]:hover:text-green-400 group-[.success]:focus:ring-green-400",
      className
    )}
    toast-close=""
    {...props}>
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description 
    ref={ref} 
    className={cn("text-sm text-gray-600", className)} 
    {...props} 
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
