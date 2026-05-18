'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  label?: string;
  children: React.ReactNode;
}

export function MobileDrawer({ label = 'Navigation', children }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 md:hidden',
          'text-foreground hover:bg-muted transition-colors',
        )}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 flex">
          <div aria-hidden className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav
            className="bg-sidebar relative z-50 flex w-72 flex-col overflow-y-auto shadow-xl"
            aria-label={label}
          >
            <div className="border-sidebar-border flex items-center justify-between border-b px-4 py-3">
              <span className="text-sidebar-foreground text-sm font-semibold">{label}</span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md p-1 transition-colors"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>{children}</div>
          </nav>
        </div>
      )}
    </>
  );
}
