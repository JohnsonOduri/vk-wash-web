
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastActionElement = React.ReactElement<typeof ToastAction>

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastAction>

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const toastStore = createStore<ToasterToast[]>([])

function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  React.useEffect(() => {
    const unsubscribe = toastStore.subscribe((state) => {
      setToasts(state)
    })
    return unsubscribe
  }, [])

  function toast(props: Omit<ToasterToast, "id">) {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...props }
    
    toastStore.setState((state) => {
      const newState = [...state, newToast]
      return newState.slice(-TOAST_LIMIT)
    })

    return {
      id,
      dismiss: () => dismiss(id),
      update: (props: ToasterToast) => update(id, props),
    }
  }

  function dismiss(id: string) {
    toastStore.setState((state) => state.filter((t) => t.id !== id))
  }

  function update(id: string, props: Partial<ToasterToast>) {
    toastStore.setState((state) =>
      state.map((t) => (t.id === id ? { ...t, ...props } : t))
    )
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}

// Store implementation
function createStore<T>(initialState: T) {
  let state = initialState
  const listeners = new Set<(state: T) => void>()
  
  return {
    getState: () => state,
    setState: (fn: (prevState: T) => T) => {
      state = fn(state)
      listeners.forEach((listener) => listener(state))
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export { 
  useToast, 
  type ToastProps,
  type ToastActionElement,
}

// Helper function for external use
function toast(props: Omit<ToasterToast, "id">) {
  const { toast } = useToast()
  return toast(props)
}

export { toast }
