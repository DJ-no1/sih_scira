'use client';

/* eslint-disable @next/next/no-img-element */
import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { Plus, GlobeHemisphereWest } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { NavigationMenu } from '@/components/user-profile';
import { ChatHistoryButton } from '@/components/chat-history-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { ShareButton } from '@/components/share';
import { cn } from '@/lib/utils';

import { useRouter, usePathname } from 'next/navigation';

type VisibilityType = 'public' | 'private';

interface NavbarProps {
  isDialogOpen: boolean;
  chatId: string | null;
  selectedVisibilityType: VisibilityType;
  onVisibilityChange: (visibility: VisibilityType) => void | Promise<void>;
  status: string;
  onHistoryClick: () => void;
}

const Navbar = memo(
  ({
    isDialogOpen,
    chatId,
    selectedVisibilityType,
    onVisibilityChange,
    status,
    onHistoryClick,
  }: NavbarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    return (
      <>
        <div
          className={cn(
            'fixed left-0 right-0 z-30 top-0 flex justify-between items-center p-3 transition-colors duration-200',
            isDialogOpen
              ? 'bg-transparent pointer-events-none'
              : status === 'streaming' || status === 'ready'
                ? 'bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
                : 'bg-background',
          )}
        >
          <div className={cn('flex items-center gap-3', isDialogOpen ? 'pointer-events-auto' : '')}>
            <Link href="/new">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg bg-accent hover:bg-accent/80 group transition-all hover:scale-105 pointer-events-auto"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-all" />
                <span className="text-sm ml-1.5 group-hover:block hidden animate-in fade-in duration-300">New</span>
              </Button>
            </Link>
          </div>

          <div className={cn('flex items-center gap-1', isDialogOpen ? 'pointer-events-auto' : '')}>
            {/* Share functionality - now available to everyone */}
            {chatId && (
              <ShareButton
                chatId={chatId}
                selectedVisibilityType={selectedVisibilityType}
                onVisibilityChange={async (visibility) => {
                  await Promise.resolve(onVisibilityChange(visibility));
                }}
                isOwner={true}
                user={null}
                variant="navbar"
                className="mr-1"
                disabled={false}
              />
            )}

            {/* Chat History Button - available to everyone */}
            <ChatHistoryButton onClickAction={onHistoryClick} />

            {/* Navigation Menu - settings icon for general navigation */}
            <NavigationMenu />
          </div>
        </div>
      </>
    );
  },
);

Navbar.displayName = 'Navbar';

export { Navbar };
