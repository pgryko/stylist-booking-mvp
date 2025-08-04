'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const modalVariants = cva('fixed inset-0 z-50 flex items-center justify-center p-4', {
  variants: {
    variant: {
      default: '',
      center: 'items-center justify-center',
      top: 'items-start justify-center pt-16',
      bottom: 'items-end justify-center pb-16',
    },
  },
  defaultVariants: {
    variant: 'center',
  },
})

const modalContentVariants = cva(
  'relative bg-background border border-border rounded-xl shadow-2xl max-h-[90vh] overflow-auto transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        default: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        '3xl': 'max-w-3xl w-full',
        '4xl': 'max-w-4xl w-full',
        full: 'max-w-[95vw] w-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface ModalProps
  extends VariantProps<typeof modalVariants>,
    VariantProps<typeof modalContentVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  variant,
  size,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  title,
  description,
}) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [open, closeOnEscape, onOpenChange])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onOpenChange(false)
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className={cn(modalVariants({ variant }))} onClick={handleOverlayClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className={cn(modalContentVariants({ size }))}>
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="space-y-1">
              {title && (
                <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
              )}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1"
                aria-label="Close modal"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('px-6', title || description || showCloseButton ? 'pb-6' : 'py-6')}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

Modal.displayName = 'Modal'

// Modal sub-components for better composition
const ModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left pb-4', className)}
      {...props}
    />
  )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
ModalDescription.displayName = 'ModalDescription'

const ModalContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)} {...props} />
  )
)
ModalContent.displayName = 'ModalContent'

const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4',
        className
      )}
      {...props}
    />
  )
)
ModalFooter.displayName = 'ModalFooter'

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  modalVariants,
  modalContentVariants,
}
