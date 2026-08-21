import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
  HTMLAttributes,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/recipe';

/**
 * Headless, fully accessible dropdown and context menu primitive.
 *
 * Built on `@radix-ui/react-dropdown-menu` and styled with the `@rtkelly13/design-system`
 * brutalist semantic tokens (0px radius, hard offset shadows, bracketed labels, and
 * semantic hover accents).
 *
 * ## Accessibility & Keybindings
 * - `Enter` / `Space`: Opens menu and activates items.
 * - `ArrowDown` / `ArrowUp`: Navigates across menu items with automatic boundary looping.
 * - `ArrowRight` / `ArrowLeft`: Opens and closes submenus.
 * - `Escape`: Closes menu and returns focus to trigger.
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button bracketed>[ ACTIONS ▼ ]</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuLabel>CLUSTER ACTIONS</DropdownMenuLabel>
 *     <DropdownMenuItem onClick={() => deploy()}>DEPLOY POD</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="danger" onClick={() => purge()}>PURGE NODE</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;

/** Trigger button or interactive element that toggles the dropdown menu. */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/** Group container for organizing related menu items. */
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

/** Portal container that renders the dropdown into the document body. */
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

/** Submenu root container. */
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/** Radio group container for mutually exclusive dropdown options. */
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/** Submenu trigger element. */
export const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center px-3 py-2 text-xs font-mono font-bold uppercase outline-none transition-colors',
      'focus:bg-surface-base focus:text-accent-primary data-[state=open]:bg-surface-base data-[state=open]:text-accent-primary',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <span className="ml-auto text-xs text-accent-secondary">▶</span>
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

/** Submenu content popup container. */
export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[9rem] overflow-hidden border-2 border-edge-strong bg-surface-raised p-1 font-mono text-content-primary shadow-hard-md',
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

/** Floating popup container that holds menu items. */
export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[10rem] overflow-hidden border-2 border-edge-strong bg-surface-raised p-1 font-mono text-content-primary shadow-hard-md',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/** Interactive item inside a dropdown menu. */
export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'danger';
  }
>(({ className, inset, variant = 'default', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-xs font-mono font-bold uppercase outline-none transition-colors',
      variant === 'default' &&
        'text-content-primary focus:bg-surface-base focus:text-accent-primary hover:bg-surface-base hover:text-accent-primary',
      variant === 'danger' &&
        'text-intent-danger focus:bg-surface-base focus:text-intent-danger hover:bg-surface-base hover:text-intent-danger',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/** Checkbox item with check indicator. */
export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center py-2 pl-8 pr-3 text-xs font-mono font-bold uppercase outline-none transition-colors',
      'text-content-primary focus:bg-surface-base focus:text-accent-primary hover:bg-surface-base hover:text-accent-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center font-bold text-accent-primary">
      <DropdownMenuPrimitive.ItemIndicator>
        ✓
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

/** Radio item with selection indicator. */
export const DropdownMenuRadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center py-2 pl-8 pr-3 text-xs font-mono font-bold uppercase outline-none transition-colors',
      'text-content-primary focus:bg-surface-base focus:text-accent-primary hover:bg-surface-base hover:text-accent-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center font-bold text-accent-secondary">
      <DropdownMenuPrimitive.ItemIndicator>
        ●
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

/** Section header label inside a dropdown menu. */
export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
    bracketed?: boolean;
  }
>(({ className, inset, bracketed = true, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-content-muted select-none',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {bracketed ? `[ ${children} ]` : children}
  </DropdownMenuPrimitive.Label>
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/** Horizontal divider rule between menu sections. */
export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-[2px] bg-edge-strong', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

/** Keyboard shortcut badge displayed at the trailing end of a menu item. */
export function DropdownMenuShortcut({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'ml-auto font-mono text-[10px] font-bold tracking-widest text-content-muted select-none',
        className,
      )}
      {...props}
    />
  );
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
