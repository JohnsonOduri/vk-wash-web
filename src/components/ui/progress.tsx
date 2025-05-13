import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const statusToPercent = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 10;        // Booked
    case 'picked': return 30;         // Picked Up
    case 'processing': return 55;     // Processing
    case 'ready': return 80;          // Ready
    case 'delivering': return 90;     // Delivering
    case 'delivered': return 100;     // Delivered
    case 'cancelled': return 0;
    default: return 0;
  }
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { status?: string }
>(({ className, value, status, ...props }, ref) => {
  // If status is provided, use statusToPercent, else fallback to value prop
  const progressValue = typeof status === 'string' ? statusToPercent(status) : (value || 0);
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
