import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-xl border bg-card text-card-foreground shadow transition-all', {
  variants: {
    variant: {
      default: 'border-border',
      outline: 'border-2 border-primary/20',
      elevated: 'shadow-lg border-0',
      gradient:
        'bg-gradient-to-br from-purple-50 to-gold-50 border-purple-200 dark:from-purple-950/20 dark:to-gold-950/20 dark:border-purple-800',
    },
    size: {
      default: 'p-6',
      sm: 'p-4',
      lg: 'p-8',
      xl: 'p-10',
    },
    interactive: {
      true: 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    interactive: false,
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, interactive, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, as: Component = 'h2', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-lg', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('pt-0', className)} {...props} />
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-6', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
