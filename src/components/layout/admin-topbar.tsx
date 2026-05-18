'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { AdminBreadcrumbs } from './admin-breadcrumbs';
import { cn } from '@/lib/utils';

interface AdminTopbarProps {
  userName?: string | null;
  userImage?: string | null;
}

export function AdminTopbar({ userName, userImage }: AdminTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <header className="border-border bg-background flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6">
      <AdminBreadcrumbs />

      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          type="button"
          className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={userName ?? 'admin'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </span>
          )}
          {userName && (
            <span className="text-foreground hidden max-w-[120px] truncate text-sm font-medium sm:block">
              {userName}
            </span>
          )}
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-transform',
              dropdownOpen && 'rotate-180',
            )}
          />
        </button>

        {dropdownOpen && (
          <div className="bg-popover border-border absolute right-0 z-50 mt-1 w-44 rounded-lg border shadow-md">
            <div className="p-1">
              <span className="text-muted-foreground flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase">
                <User className="h-3.5 w-3.5" />
                Admin
              </span>
              <hr className="border-border my-1" />
              <button
                type="button"
                className="text-destructive hover:bg-accent flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4" />
                გამოსვლა
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
