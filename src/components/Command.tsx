import { Command as CommandPrimitive } from 'cmdk';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/recipe';
import { Modal, type ModalProps } from './Modal';

/**
 * Headless Command Palette and Spotlight search engine.
 *
 * Built on `cmdk` and styled with `@rtkelly13/design-system` brutalist semantic tokens
 * (0px radius, hard offset shadows, bracketed group titles, and monospace prompts).
 *
 * @example
 * ```tsx
 * <Command className="border-2 border-edge-strong">
 *   <CommandInput placeholder="Type a command or search..." />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *     <CommandGroup heading="SYSTEM ACTIONS">
 *       <CommandItem onSelect={() => deploy()}>Deploy Application</CommandItem>
 *       <CommandItem onSelect={() => restart()}>Restart Cluster</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
export const Command = forwardRef<
  ElementRef<typeof CommandPrimitive>,
  ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden bg-surface-raised font-mono text-content-primary',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

export interface CommandDialogProps extends Omit<ModalProps, 'children' | 'title'> {
  children: ReactNode;
  title?: string;
}

/**
 * Modal dialog container for the Command Palette.
 */
export function CommandDialog({
  children,
  title = 'COMMAND PALETTE',
  isOpen,
  onClose,
  className,
  ...props
}: CommandDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={cn('max-w-2xl overflow-hidden p-0', className)}
      {...props}
    >
      <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-content-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5">
        {children}
      </Command>
    </Modal>
  );
}

/**
 * Search input field for the Command Palette with a terminal prompt.
 */
export const CommandInput = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b-2 border-edge-strong bg-surface-base px-3"
    cmdk-input-wrapper=""
  >
    <span className="mr-2 font-mono text-sm font-bold text-accent-primary select-none">
      &gt;
    </span>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full bg-transparent py-3 font-mono text-sm text-content-primary outline-none placeholder:text-content-muted disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

/**
 * Scrollable list container that renders filtered command items.
 */
export const CommandList = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'max-h-[300px] overflow-y-auto overflow-x-hidden p-2 font-mono divide-y-2 divide-edge-strong',
      className,
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

/**
 * Empty state message displayed when no search results match the query.
 */
export const CommandEmpty = forwardRef<
  ElementRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center font-mono text-xs text-content-muted select-none"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

/**
 * Group section inside the command list with a bracketed header.
 */
export const CommandGroup = forwardRef<
  ElementRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, heading, children, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    heading={heading ? `[ ${heading} ]` : undefined}
    className={cn(
      'overflow-hidden p-1 text-content-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-content-muted select-none',
      className,
    )}
    {...props}
  >
    {children}
  </CommandPrimitive.Group>
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

/**
 * Horizontal separator between command groups.
 */
export const CommandSeparator = forwardRef<
  ElementRef<typeof CommandPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-[2px] bg-edge-strong', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/**
 * Selectable command item row.
 */
export const CommandItem = forwardRef<
  ElementRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-xs font-mono font-bold uppercase outline-none transition-colors',
      'text-content-primary data-[selected=true]:bg-surface-base data-[selected=true]:text-accent-primary',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

/**
 * Keyboard shortcut tag rendered at the end of a command item.
 */
export function CommandShortcut({
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
CommandShortcut.displayName = 'CommandShortcut';
