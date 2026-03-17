"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          color: '#1f2937',
          fontSize: '14px',
        },
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-700',
          actionButton: 'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50',
          cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900',
        },
      }}
      position="top-right"
      {...props}
    />
  )
}

export { Toaster }
