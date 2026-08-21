import * as PopoverPrimitive from '@radix-ui/react-popover';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/recipe';

/**
 * Headless, accessible popover primitive for floating content, rich disclosures,
 * and context inspectors.
 *
 * Built on `@radix-ui/react-popover` with collision boundary detection, automatic
 * positioning, and focus management. Styled with `@rtkelly13/design-system`
 * semantic tokens and hard offset shadows.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button bracketed>[ INSPECT NODE ]</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <div className="space-y-2">
 *       <h4 className="font-display text-sm font-bold uppercase">[ NODE DETAILS ]</h4>
 *       <p className="text-xs text-content-muted">Memory utilization: 42%</p>
 *     </div>
 *   </PopoverContent>
 * </Popover>
 * ```
 */
export const Popover = PopoverPrimitive.Root;

/** Trigger button or control that toggles the popover. */
export const PopoverTrigger = PopoverPrimitive.Trigger;

/** Anchor element to position the popover against when not using the trigger. */
export const PopoverAnchor = PopoverPrimitive.Anchor;

/** Close button control inside the popover. */
export const PopoverClose = PopoverPrimitive.Close;

/** Floating popup container that displays popover content. */
export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 border-2 border-edge-strong bg-surface-raised p-4 font-mono text-content-primary shadow-hard-md outline-none',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
