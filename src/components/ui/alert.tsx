'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type AlertProps = React.HTMLAttributes<HTMLDivElement>

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-red-600',
      className
    )}
    {...props}
  />
))
Alert.displayName = 'Alert'

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed text-red-800', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
