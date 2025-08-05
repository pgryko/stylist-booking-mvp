'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onOpenChange) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-10 w-full max-w-lg mx-4">{children}</div>
    </div>
  )
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative bg-white rounded-lg shadow-lg max-h-[90vh] overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  )
)
DialogContent.displayName = 'DialogContent'

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0', className)}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>

const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
DialogTitle.displayName = 'DialogTitle'

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
  )
)
DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle }
