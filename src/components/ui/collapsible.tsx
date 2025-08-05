import React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined)

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible')
  }
  return context
}

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open = false, onOpenChange, children, className }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open)

    const isOpen = onOpenChange ? open : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    React.useEffect(() => {
      if (onOpenChange) {
        setInternalOpen(open)
      }
    }, [open, onOpenChange])

    return (
      <CollapsibleContext.Provider
        value={{
          open: isOpen,
          onOpenChange: setOpen,
        }}
      >
        <div ref={ref} className={cn('', className)}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { onOpenChange, open } = useCollapsible()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(!open)
    onClick?.(event)
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn('', className)}
      onClick={handleClick}
      {...props}
    />
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = useCollapsible()
    const [height, setHeight] = React.useState<number | undefined>(open ? undefined : 0)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (contentRef.current) {
        if (open) {
          setHeight(contentRef.current.scrollHeight)
          // After animation, set to auto for content that might change
          const timer = setTimeout(() => setHeight(undefined), 300)
          return () => clearTimeout(timer)
        } else {
          setHeight(0)
        }
      }
    }, [open])

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-all duration-300 ease-in-out', className)}
        style={{ height }}
        {...props}
      >
        <div ref={contentRef} className="pt-2">
          {children}
        </div>
      </div>
    )
  }
)
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
