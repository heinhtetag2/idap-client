import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  };
  secondaryAction?: { label: string; onClick: () => void };
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white border border-[#E3E3E3] shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-[#1A1A1A]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-[#8A8A8A] mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {children && <div className="px-6 pb-5">{children}</div>}

          {(primaryAction || secondaryAction) && (
            <div className="px-6 py-3 border-t border-[#E3E3E3] bg-[#FAFAFA] flex items-center justify-end gap-2 rounded-b-lg">
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#E3E3E3] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {secondaryAction.label}
                </button>
              )}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                    primaryAction.danger
                      ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                      : 'bg-[#FF3C21] hover:bg-[#E63419]',
                  )}
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
