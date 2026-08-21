import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/recipe';

/**
 * Global provider for managing tooltip delay timers and shared tooltip state.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Root container for an individual tooltip.
 *
 * Built on `@radix-ui/react-tooltip` and styled with `@rtkelly13/design-system`
 * brutalist semantic tokens.
 *
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button size="sm">[ RUN ]</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       <span>&gt; Execute telemetry benchmark</span>
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
export const Tooltip = TooltipPrimitive.Root;

/** Trigger element that displays the tooltip on hover or keyboard focus. */
export const TooltipTrigger = TooltipPrimitive.Trigger;

/** Floating popup container that displays tooltip text. */
export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden border-2 border-edge-strong bg-surface-base px-3 py-1.5 font-mono text-xs text-content-primary shadow-hard-sm',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
